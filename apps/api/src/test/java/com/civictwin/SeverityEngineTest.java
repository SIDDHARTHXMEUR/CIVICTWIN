package com.civictwin;

import com.civictwin.model.Location;
import com.civictwin.model.WaterIncident;
import com.civictwin.service.RuleBasedSeverity;
import com.civictwin.service.SeverityEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SeverityEngineTest {

    @Test
    @DisplayName("Test Strategy Pattern Rule-Based Severity Scoring")
    void testSeverityScoring() {
        SeverityEngine engine = new SeverityEngine(new RuleBasedSeverity());
        WaterIncident incident = new WaterIncident("INC-99", "Severe Burst", "Pipe Failure", new Location(26.91, 75.78, "Main"), 9);
        incident.setReportCount(4);

        double score = engine.evaluateAndUpdate(incident);

        assertTrue(score >= 75.0, "High severity with corroboration should produce critical priority score");
        assertEquals("DISPATCH CREW", incident.getRecommendedAction());
        assertEquals("critical", incident.getTab());
    }
}
