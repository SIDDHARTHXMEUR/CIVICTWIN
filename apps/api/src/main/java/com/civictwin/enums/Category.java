package com.civictwin.enums;

/**
 * Java Concept: Enumerated Types (Enums) & String Mapping.
 * Represents the 5 operational domains for urban incident classification.
 */
public enum Category {
    WATER("water", "Water Leakage & Pipe Fracture"),
    TRAFFIC("traffic", "Traffic Bottleneck & Signal Desync"),
    AQI("aqi", "Environmental & AQI Surge"),
    ROAD_HAZARD("road_hazard", "Road Hazard & Drainage Overflow"),
    INFRASTRUCTURE("infrastructure", "Infrastructure & Power Failure");

    private final String code;
    private final String description;

    Category(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static Category fromCode(String code) {
        if (code == null) return INFRASTRUCTURE;
        String normalized = code.toLowerCase().trim();
        for (Category c : values()) {
            if (c.code.equalsIgnoreCase(normalized) || normalized.contains(c.code)) {
                return c;
            }
        }
        return INFRASTRUCTURE;
    }
}
