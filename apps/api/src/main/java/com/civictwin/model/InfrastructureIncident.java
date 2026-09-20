package com.civictwin.model;

import com.civictwin.enums.Category;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Concrete Subclass & Polymorphic Implementation.
 * General infrastructure & electrical grid failure incident.
 */
@Entity
@DiscriminatorValue("INFRASTRUCTURE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class InfrastructureIncident extends Incident {

    private Double gridVoltageDropPct = 12.5;

    public InfrastructureIncident(String id, String title, String description, Location location, Integer severity) {
        super(id, title, Category.INFRASTRUCTURE, description, location, severity);
    }

    @Override
    public double calculateDomainImpact() {
        return (getSeverity() * 9.5) + (getReportCount() * 4.5) + (gridVoltageDropPct * 1.2);
    }
}
