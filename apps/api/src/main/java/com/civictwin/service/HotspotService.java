package com.civictwin.service;

import com.civictwin.enums.RiskState;
import com.civictwin.model.Incident;
import com.civictwin.repository.IncidentRepository;
import com.civictwin.util.GeoUtil;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Java Concept: Hand-Implemented Spatial Algorithm (DBSCAN Clustering).
 * Density-Based Spatial Clustering of Applications with Noise (DBSCAN) over active incident coordinates.
 * Evaluates spatial cluster density without third-party GIS libraries and returns RiskState.
 */
@Service
public class HotspotService {

    private static final double EPSILON_METERS = 1000.0; // 1 km neighborhood radius
    private static final int MIN_PTS = 3;                // Min points for a dense core cluster

    private final IncidentRepository incidentRepository;

    public HotspotService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public Map<String, Object> analyzeHotspots() {
        List<Incident> activeIncidents = incidentRepository.findActiveIncidents();
        List<List<Incident>> clusters = dbscan(activeIncidents, EPSILON_METERS, MIN_PTS);

        int maxClusterSize = clusters.stream().mapToInt(List::size).max().orElse(0);

        RiskState overallRisk;
        if (maxClusterSize >= 5) {
            overallRisk = RiskState.CRITICAL;
        } else if (maxClusterSize >= 3) {
            overallRisk = RiskState.EMERGING;
        } else {
            overallRisk = RiskState.NORMAL;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("riskState", overallRisk);
        result.put("totalActiveIncidents", activeIncidents.size());
        result.put("clusterCount", clusters.size());
        result.put("maxClusterSize", maxClusterSize);
        result.put("clusters", clusters);
        return result;
    }

    /**
     * Java Concept: DBSCAN Clustering Core Implementation.
     */
    public List<List<Incident>> dbscan(List<Incident> incidents, double epsMeters, int minPts) {
        List<List<Incident>> clusters = new ArrayList<>();
        Set<String> visited = new HashSet<>();

        for (Incident inc : incidents) {
            if (inc.getLocation() == null || inc.getLocation().getLat() == null) continue;
            if (visited.contains(inc.getId())) continue;

            visited.add(inc.getId());
            List<Incident> neighbors = getNeighbors(inc, incidents, epsMeters);

            if (neighbors.size() >= minPts) {
                List<Incident> cluster = new ArrayList<>();
                expandCluster(inc, neighbors, cluster, incidents, visited, epsMeters, minPts);
                clusters.add(cluster);
            }
        }
        return clusters;
    }

    private void expandCluster(Incident point, List<Incident> neighbors, List<Incident> cluster,
                               List<Incident> allPoints, Set<String> visited, double epsMeters, int minPts) {
        cluster.add(point);
        Queue<Incident> queue = new LinkedList<>(neighbors);

        while (!queue.isEmpty()) {
            Incident current = queue.poll();
            if (!visited.contains(current.getId())) {
                visited.add(current.getId());
                List<Incident> currentNeighbors = getNeighbors(current, allPoints, epsMeters);
                if (currentNeighbors.size() >= minPts) {
                    queue.addAll(currentNeighbors);
                }
            }
            if (cluster.stream().noneMatch(i -> i.getId().equals(current.getId()))) {
                cluster.add(current);
            }
        }
    }

    private List<Incident> getNeighbors(Incident center, List<Incident> allPoints, double epsMeters) {
        List<Incident> neighbors = new ArrayList<>();
        double cLat = center.getLocation().getLat();
        double cLng = center.getLocation().getLng();

        for (Incident other : allPoints) {
            if (other.getLocation() == null || other.getLocation().getLat() == null) continue;
            double dist = GeoUtil.haversineDistanceMeters(cLat, cLng, other.getLocation().getLat(), other.getLocation().getLng());
            if (dist <= epsMeters) {
                neighbors.add(other);
            }
        }
        return neighbors;
    }
}
