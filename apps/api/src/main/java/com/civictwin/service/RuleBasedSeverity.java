package com.civictwin.service;

import com.civictwin.model.Incident;
import org.springframework.stereotype.Component;

/**
 * Java Concept: Concrete Strategy Implementation (Rule-Based Algorithm).
 * Implements the formula: score = severityWeight + min(corroboration,5)*5 + categoryImpact + ageMinutes*0.5
 */
@Component
public class RuleBasedSeverity implements SeverityStrategy {

    @Override
    public double calculateScore(Incident incident) {
        if (incident == null) return 0.0;

        double severityWeight = (incident.getSeverity() != null ? incident.getSeverity() : 5) * 6.0;
        int corroboration = Math.min(incident.getReportCount() != null ? incident.getReportCount() : 1, 5);
        double corroborationBonus = corroboration * 5.0;

        double categoryImpact = incident.calculateDomainImpact();

        long ageMinutes = 0;
        if (incident.getCreatedAt() != null) {
            ageMinutes = Math.max(0, (System.currentTimeMillis() - incident.getCreatedAt()) / (1000 * 60));
        }
        double ageFactor = Math.min(25.0, ageMinutes * 0.5);

        double totalScore = severityWeight + corroborationBonus + (categoryImpact * 0.3) + ageFactor;
        return Math.min(100.0, Math.max(5.0, totalScore));
    }

    @Override
    public String recommendAction(Incident incident, double score) {
        if (score >= 75.0) {
            return "DISPATCH CREW";
        } else if (score >= 55.0) {
            return "VERIFY TELEMETRY";
        } else if (score >= 35.0) {
            return "NOTIFY TRANSIT";
        } else {
            return "ISOLATE GRID";
        }
    }
}
