package com.civictwin.service;

import com.civictwin.model.AuditEvent;
import com.civictwin.repository.AuditEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Java Concept: Append-Only Immutable Logging Service.
 */
@Service
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    public void logEvent(String actor, String action, String incidentId, String details) {
        AuditEvent event = new AuditEvent(actor, action, incidentId, details);
        auditEventRepository.save(event);
    }

    public List<AuditEvent> getRecentEvents() {
        return auditEventRepository.findAllByOrderByTimestampDesc();
    }
}
