package com.civictwin.service;

import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import com.civictwin.repository.IncidentRepository;
import com.civictwin.util.GeoUtil;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Java Concept: Spatial Merging Algorithm & Stream Filtering.
 * Implements 500m Haversine distance proximity check to merge duplicate public reports
 * into existing active incidents rather than creating duplicate records.
 */
@Service
public class MergeService {

    private static final double MERGE_RADIUS_METERS = 500.0;
    private final IncidentRepository incidentRepository;

    public MergeService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public Optional<Incident> findNearbyActiveIncident(Category category, double lat, double lng) {
        List<Incident> activeIncidents = incidentRepository.findActiveIncidents();

        return activeIncidents.stream()
                .filter(i -> i.getCategory() == category)
                .filter(i -> i.getStatus() != Status.RESOLVED)
                .filter(i -> i.getLocation() != null && i.getLocation().getLat() != null && i.getLocation().getLng() != null)
                .filter(i -> GeoUtil.haversineDistanceMeters(lat, lng, i.getLocation().getLat(), i.getLocation().getLng()) <= MERGE_RADIUS_METERS)
                .findFirst();
    }
}
