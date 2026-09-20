package com.civictwin.model;

import com.civictwin.enums.Category;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Concrete Subclass & Method Overriding (Polymorphism).
 * Specific domain incident for water leakage & main pipe fracture.
 */
@Entity
@DiscriminatorValue("WATER")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class WaterIncident extends Incident {

    private Double estimatedFlowRateLps = 15.0; // Liters per second

    public WaterIncident(String id, String title, String description, Location location, Integer severity) {
        super(id, title, Category.WATER, description, location, severity);
    }

    @Override
    public double calculateDomainImpact() {
        return (getSeverity() * 8.5) + (getReportCount() * 3.0) + (estimatedFlowRateLps * 0.4);
    }
}
