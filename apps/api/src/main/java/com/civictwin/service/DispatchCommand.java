package com.civictwin.service;

import com.civictwin.enums.Status;
import com.civictwin.model.Incident;

/**
 * Java Concept: Concrete Command Pattern Implementation.
 * Encapsulates crew dispatch state transitions.
 */
public class DispatchCommand implements Command {

    private final DispatchService dispatchService;

    public DispatchCommand(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @Override
    public void execute(Incident incident) {
        incident.setStatus(Status.DISPATCHED);
        incident.setUpdatedAt(System.currentTimeMillis());
        if (dispatchService != null) {
            dispatchService.assignNearestCrew(incident);
        }
    }
}
