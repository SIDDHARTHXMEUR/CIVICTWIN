package com.civictwin.model;

import com.civictwin.enums.Category;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Concrete Subclass & Polymorphic Method Execution.
 * Specific domain incident for mobility bottlenecks & traffic signal desync.
 */
@Entity
@DiscriminatorValue("TRAFFIC")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TrafficIncident extends Incident {

    private Integer estimatedDelayMinutes = 20;

    public TrafficIncident(String id, String title, String description, Location location, Integer severity) {
        super(id, title, Category.TRAFFIC, description, location, severity);
    }

    @Override
    public double calculateDomainImpact() {
        return (getSeverity() * 9.0) + (getReportCount() * 4.0) + (estimatedDelayMinutes * 0.8);
    }
}
