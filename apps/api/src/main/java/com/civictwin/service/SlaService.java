package com.civictwin.service;

import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import com.civictwin.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Java Concept: Service Layer SLA Watcher Logic.
 */
@Service
public class SlaService {

    private final IncidentRepository incidentRepository;
    private final AuditService auditService;

    public SlaService(IncidentRepository incidentRepository, AuditService auditService) {
        this.incidentRepository = incidentRepository;
        this.auditService = auditService;
    }

    public void checkAndEscalateOverdue() {
        List<Incident> active = incidentRepository.findActiveIncidents();
        long now = System.currentTimeMillis();

        for (Incident incident : active) {
            long ageMinutes = (now - (incident.getCreatedAt() != null ? incident.getCreatedAt() : now)) / (1000 * 60);

            // Critical > 30m, High > 60m SLA breach
            boolean breach = (incident.getSeverity() >= 8 && ageMinutes > 30) ||
                             (incident.getSeverity() >= 6 && ageMinutes > 60);

            if (breach && incident.getStatus() != Status.DISPATCHED) {
                incident.setSeverity(Math.min(10, incident.getSeverity() + 1));
                incident.setTab("critical");
                incidentRepository.save(incident);

                auditService.logEvent("SLA_WATCHER", "AUTO_ESCALATE", incident.getId(),
                        "Overdue by " + ageMinutes + " mins. Severity auto-escalated to " + incident.getSeverity());
            }
        }
    }
}
