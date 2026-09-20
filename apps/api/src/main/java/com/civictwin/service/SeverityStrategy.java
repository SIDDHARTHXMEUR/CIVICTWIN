package com.civictwin.service;

import com.civictwin.model.Incident;

/**
 * Java Concept: Strategy Design Pattern (Strategy Interface).
 * Defines an interchangeable algorithm contract for evaluating threat severity scores.
 */
public interface SeverityStrategy {

    /**
     * Calculates composite priority score based on corroboration, category impact, and age.
     */
    double calculateScore(Incident incident);

    /**
     * Recommends standard municipal operational action.
     */
    String recommendAction(Incident incident, double score);
}
