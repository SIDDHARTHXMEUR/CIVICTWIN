package com.civictwin.service;

import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import com.civictwin.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Java Concept: Functional Programming with Java Streams (map, filter, reduce, collect).
 * Computes executive KPI summary metrics and per-domain badge counters.
 */
@Service
public class AnalyticsService {

    private final IncidentRepository incidentRepository;

    public AnalyticsService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public Map<String, Object> getExecutiveSummary() {
        List<Incident> allIncidents = incidentRepository.findAll();

        long activeCount = allIncidents.stream()
                .filter(i -> i.getStatus() != Status.RESOLVED)
                .count();

        long resolvedCount = allIncidents.stream()
                .filter(i -> i.getStatus() == Status.RESOLVED)
                .count();

        double avgSeverity = allIncidents.stream()
                .filter(i -> i.getStatus() != Status.RESOLVED)
                .mapToInt(i -> i.getSeverity() != null ? i.getSeverity() : 5)
                .average()
                .orElse(0.0);

        Map<Category, Long> categoryCounts = allIncidents.stream()
                .filter(i -> i.getStatus() != Status.RESOLVED)
                .collect(Collectors.groupingBy(Incident::getCategory, Collectors.counting()));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("cityHealthScore", 98.0);
        summary.put("activeIncidentsCount", activeCount);
        summary.put("resolvedCount", resolvedCount);
        summary.put("averageSeverity", Math.round(avgSeverity * 10.0) / 10.0);
        summary.put("domainBadgeCounts", categoryCounts);

        return summary;
    }
}
