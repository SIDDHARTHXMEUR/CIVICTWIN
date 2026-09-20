package com.civictwin.service;

import com.civictwin.model.Incident;

/**
 * Java Concept: Command Design Pattern (Command Interface).
 * Encapsulates operational decisions as executable command objects.
 */
public interface Command {
    void execute(Incident incident);
}
