package com.civictwin.repository;

import com.civictwin.model.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, String> {
    List<AuditEvent> findByIncidentIdOrderByTimestampDesc(String incidentId);
    List<AuditEvent> findAllByOrderByTimestampDesc();
}
