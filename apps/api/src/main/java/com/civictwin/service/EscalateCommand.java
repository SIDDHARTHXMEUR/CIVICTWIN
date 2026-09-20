package com.civictwin.service;

import com.civictwin.model.Incident;

/**
 * Java Concept: Concrete Command Pattern Implementation.
 * Escolates incident severity weight and priority score.
 */
public class EscalateCommand implements Command {

    @Override
    public void execute(Incident incident) {
        incident.setSeverity(Math.min(10, (incident.getSeverity() != null ? incident.getSeverity() : 5) + 2));
        incident.setPriorityScore(Math.min(100.0, (incident.getPriorityScore() != null ? incident.getPriorityScore() : 50.0) + 20.0));
        incident.setUpdatedAt(System.currentTimeMillis());
        incident.setTab("critical");
    }
}
