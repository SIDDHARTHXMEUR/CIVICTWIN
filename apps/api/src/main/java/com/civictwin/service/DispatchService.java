package com.civictwin.service;

import com.civictwin.model.Crew;
import com.civictwin.model.Incident;
import com.civictwin.repository.CrewRepository;
import com.civictwin.util.GeoUtil;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Java Concept: Greedy Optimization Algorithm & Java Stream Comparator.
 * Finds nearest available crew using Haversine distance calculation and assigns them to an incident.
 */
@Service
public class DispatchService {

    private final CrewRepository crewRepository;

    public DispatchService(CrewRepository crewRepository) {
        this.crewRepository = crewRepository;
    }

    public Optional<Crew> assignNearestCrew(Incident incident) {
        if (incident == null || incident.getLocation() == null) {
            return Optional.empty();
        }

        List<Crew> availableCrews = crewRepository.findByStatus("IDLE");
        if (availableCrews.isEmpty()) {
            return Optional.empty();
        }

        double incLat = incident.getLocation().getLat();
        double incLng = incident.getLocation().getLng();

        Optional<Crew> nearest = availableCrews.stream()
                .filter(c -> c.getLocation() != null && c.getLocation().getLat() != null && c.getLocation().getLng() != null)
                .min(Comparator.comparingDouble(c ->
                        GeoUtil.haversineDistanceMeters(incLat, incLng, c.getLocation().getLat(), c.getLocation().getLng())));

        if (nearest.isPresent()) {
            Crew crew = nearest.get();
            crew.setStatus("DISPATCHED");
            crew.setAssignedIncidentId(incident.getId());
            crewRepository.save(crew);

            incident.setAssignedCrewId(crew.getId());
            return Optional.of(crew);
        }

        return Optional.empty();
    }
}
