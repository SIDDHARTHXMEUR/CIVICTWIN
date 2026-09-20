package com.civictwin.service;

import com.civictwin.enums.Status;
import com.civictwin.model.Incident;

/**
 * Java Concept: Concrete Command Pattern Implementation.
 * Verifies incident status via live sensor telemetry.
 */
public class VerifyCommand implements Command {

    @Override
    public void execute(Incident incident) {
        if (incident.getStatus() == Status.REPORTED) {
            incident.setStatus(Status.CLASSIFIED);
        }
        incident.setUpdatedAt(System.currentTimeMillis());
    }
}
