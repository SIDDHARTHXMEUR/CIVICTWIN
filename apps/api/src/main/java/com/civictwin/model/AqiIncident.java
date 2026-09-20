package com.civictwin.model;

import com.civictwin.enums.Category;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Concrete Subclass & Polymorphic Method Overriding.
 * Environmental AQI surge incident.
 */
@Entity
@DiscriminatorValue("AQI")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AqiIncident extends Incident {

    private Integer pm25Ppm = 180;

    public AqiIncident(String id, String title, String description, Location location, Integer severity) {
        super(id, title, Category.AQI, description, location, severity);
    }

    @Override
    public double calculateDomainImpact() {
        return (getSeverity() * 7.5) + (getReportCount() * 2.5) + (pm25Ppm * 0.15);
    }
}
