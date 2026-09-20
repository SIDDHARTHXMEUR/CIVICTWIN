package com.civictwin.enums;

/**
 * Java Concept: Enumerated Types & Priority Weighting.
 * Defines threat level categories with integer severity weights.
 */
public enum Severity {
    LOW(1, 25),
    MEDIUM(2, 50),
    HIGH(3, 75),
    CRITICAL(4, 95);

    private final int weight;
    private final int scoreThreshold;

    Severity(int weight, int scoreThreshold) {
        this.weight = weight;
        this.scoreThreshold = scoreThreshold;
    }

    public int getWeight() {
        return weight;
    }

    public int getScoreThreshold() {
        return scoreThreshold;
    }

    public static Severity fromScore(double score) {
        if (score >= 80) return CRITICAL;
        if (score >= 60) return HIGH;
        if (score >= 35) return MEDIUM;
        return LOW;
    }
}
