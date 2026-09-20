package com.civictwin.service;

import com.civictwin.enums.Severity;
import com.civictwin.model.Incident;
import org.springframework.stereotype.Service;

/**
 * Java Concept: Strategy Pattern Context Class & Dynamic Polymorphism.
 * Wraps dynamic SeverityStrategy evaluation and populates priority scores, impact, and action strings.
 */
@Service
public class SeverityEngine {

    private final SeverityStrategy strategy;

    public SeverityEngine(SeverityStrategy strategy) {
        this.strategy = strategy;
    }

    public double evaluateAndUpdate(Incident incident) {
        double score = strategy.calculateScore(incident);
        incident.setPriorityScore(score);
        incident.setImpactPct(score);
        incident.setRecommendedAction(strategy.recommendAction(incident, score));

        Severity level = Severity.fromScore(score);
        if (level == Severity.CRITICAL) {
            incident.setTab("critical");
        } else if (level == Severity.HIGH || level == Severity.MEDIUM) {
            incident.setTab("warning");
        } else {
            incident.setTab("stable");
        }

        return score;
    }
}
