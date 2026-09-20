package com.civictwin.service;

import com.civictwin.enums.ActionType;
import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import com.civictwin.exception.InvalidLocationException;
import com.civictwin.model.*;
import com.civictwin.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.PriorityBlockingQueue;

/**
 * Java Concept: Thread-Safe Priority Queue (PriorityBlockingQueue), Command Execution, & Report Merging.
 * Manages incident lifecycle, 500m haversine intake deduplication, and Decision Rail ordering.
 */
@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final MergeService mergeService;
    private final SeverityEngine severityEngine;
    private final DispatchService dispatchService;
    private final AuditService auditService;

    // Decision Rail: Thread-safe priority queue ordered by incident priorityScore
    private final PriorityBlockingQueue<Incident> decisionRailQueue = new PriorityBlockingQueue<>();

    public IncidentService(IncidentRepository incidentRepository,
                           MergeService mergeService,
                           SeverityEngine severityEngine,
                           DispatchService dispatchService,
                           AuditService auditService) {
        this.incidentRepository = incidentRepository;
        this.mergeService = mergeService;
        this.severityEngine = severityEngine;
        this.dispatchService = dispatchService;
        this.auditService = auditService;
    }

    /**
     * Intake new incident report with location validation and 500m deduplication merging.
     */
    public Map<String, Object> intakeReport(String categoryCode, String title, String description,
                                             Double lat, Double lng, String address, Integer severity) {

        // Validate lat/lon range around Rajasthan / Jaipur node
        if (lat == null || lng == null || lat < 8.0 || lat > 38.0 || lng < 68.0 || lng > 97.0) {
            throw new InvalidLocationException("Invalid geographic coordinates: lat=" + lat + ", lng=" + lng);
        }

        Category category = Category.fromCode(categoryCode);
        Optional<Incident> nearby = mergeService.findNearbyActiveIncident(category, lat, lng);

        Map<String, Object> result = new LinkedHashMap<>();

        if (nearby.isPresent()) {
            Incident existing = nearby.get();
            existing.setReportCount(existing.getReportCount() + 1);
            existing.setUpdatedAt(System.currentTimeMillis());
            severityEngine.evaluateAndUpdate(existing);
            incidentRepository.save(existing);
            updateQueue(existing);

            auditService.logEvent("CITIZEN_PORTAL", "MERGE_REPORT", existing.getId(),
                    "Corroboration count incremented to " + existing.getReportCount());

            result.put("incident", existing);
            result.put("merged", true);
            return result;
        }

        String incidentId = "INC-" + String.format("%03d", System.currentTimeMillis() % 10000);
        Location loc = new Location(lat, lng, address != null ? address : "Jaipur Grid Location");

        Incident newIncident;
        switch (category) {
            case WATER -> newIncident = new WaterIncident(incidentId, title, description, loc, severity);
            case TRAFFIC -> newIncident = new TrafficIncident(incidentId, title, description, loc, severity);
            case AQI -> newIncident = new AqiIncident(incidentId, title, description, loc, severity);
            case ROAD_HAZARD -> newIncident = new RoadHazardIncident(incidentId, title, description, loc, severity);
            default -> newIncident = new InfrastructureIncident(incidentId, title, description, loc, severity);
        }

        severityEngine.evaluateAndUpdate(newIncident);
        incidentRepository.save(newIncident);
        decisionRailQueue.add(newIncident);

        auditService.logEvent("CITIZEN_PORTAL", "CREATE_INCIDENT", newIncident.getId(),
                "Created new incident with category " + category);

        result.put("incident", newIncident);
        result.put("merged", false);
        return result;
    }

    /**
     * Execute Decision Rail action using Command Pattern.
     */
    public Incident executeAction(String incidentId, ActionType actionType, String actor) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        Command cmd;
        switch (actionType) {
            case DISPATCH -> cmd = new DispatchCommand(dispatchService);
            case ESCALATE -> cmd = new EscalateCommand();
            case RESOLVE -> cmd = new ResolveCommand();
            case VERIFY -> cmd = new VerifyCommand();
            default -> throw new IllegalArgumentException("Unsupported action type: " + actionType);
        }

        cmd.execute(incident);
        severityEngine.evaluateAndUpdate(incident);
        incidentRepository.save(incident);
        updateQueue(incident);

        auditService.logEvent(actor != null ? actor : "OFFICER", actionType.name(), incident.getId(),
                "Executed action " + actionType.name() + " on incident " + incident.getId());

        return incident;
    }

    public List<Incident> getAllActiveIncidents() {
        return incidentRepository.findActiveIncidents();
    }

    public List<Incident> getResolvedToday() {
        long startOfDay = System.currentTimeMillis() - (24 * 3600 * 1000);
        return incidentRepository.findResolvedSince(startOfDay);
    }

    private void updateQueue(Incident incident) {
        decisionRailQueue.removeIf(i -> i.getId().equals(incident.getId()));
        if (incident.getStatus() != Status.RESOLVED) {
            decisionRailQueue.add(incident);
        }
    }
}
