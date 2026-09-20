package com.civictwin.service;

import com.civictwin.enums.Status;
import com.civictwin.model.Incident;

/**
 * Java Concept: Concrete Command Pattern Implementation.
 * Marks incident as RESOLVED.
 */
public class ResolveCommand implements Command {

    @Override
    public void execute(Incident incident) {
        incident.setStatus(Status.RESOLVED);
        incident.setUpdatedAt(System.currentTimeMillis());
        incident.setTab("stable");
    }
}
