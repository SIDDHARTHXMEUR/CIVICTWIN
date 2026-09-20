package com.civictwin.model;

import com.civictwin.enums.Category;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Concrete Subclass & Polymorphic Implementation.
 * Road hazard & drainage overflow incident.
 */
@Entity
@DiscriminatorValue("ROAD_HAZARD")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class RoadHazardIncident extends Incident {

    private Boolean laneBlocked = true;

    public RoadHazardIncident(String id, String title, String description, Location location, Integer severity) {
        super(id, title, Category.ROAD_HAZARD, description, location, severity);
    }

    @Override
    public double calculateDomainImpact() {
        return (getSeverity() * 8.0) + (getReportCount() * 3.5) + (Boolean.TRUE.equals(laneBlocked) ? 25.0 : 0.0);
    }
}
