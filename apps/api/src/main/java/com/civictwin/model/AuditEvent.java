package com.civictwin.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Java Concept: Immutable Append-Only Audit Event Data Structure.
 * Records state change audit trails (who, what, when).
 */
@Entity
@Table(name = "audit_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    @Id
    private String id;

    private String actor;

    private String action;

    private String incidentId;

    private String details;

    private Long timestamp;

    public AuditEvent(String actor, String action, String incidentId, String details) {
        this.id = UUID.randomUUID().toString();
        this.actor = actor;
        this.action = action;
        this.incidentId = incidentId;
        this.details = details;
        this.timestamp = Instant.now().toEpochMilli();
    }
}
