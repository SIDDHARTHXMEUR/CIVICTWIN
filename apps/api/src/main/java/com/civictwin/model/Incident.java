package com.civictwin.model;

import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Object-Oriented Inheritance & Abstract Classes.
 * Base entity for all urban incidents, implementing Comparable<Incident> to enable
 * priority ordering inside the Decision Rail's PriorityBlockingQueue.
 */
@Entity
@Table(name = "incidents")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "incident_type", discriminatorType = DiscriminatorType.STRING)
@Data
@NoArgsConstructor
public abstract class Incident implements Comparable<Incident> {

    @Id
    private String id;

    private String title;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Status status = Status.REPORTED;

    private Integer severity = 5;

    @Embedded
    private Location location;

    private Integer reportCount = 1;

    private Long createdAt = System.currentTimeMillis();

    private Long updatedAt = System.currentTimeMillis();

    private String recommendedAction;

    private String rootCause;

    private String assignedCrewId;

    private Double impactPct = 50.0;

    private Double priorityScore = 0.0;

    private String tab = "warning";

    public Incident(String id, String title, Category category, String description, Location location, Integer severity) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.location = location;
        this.severity = severity != null ? severity : 5;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }

    /**
     * Java Concept: Abstract Methods & Polymorphism.
     * Every specific domain incident type must define its domain-specific impact formula.
     */
    public abstract double calculateDomainImpact();

    /**
     * Java Concept: Interface Implementation & Comparable Interface.
     * Priority ordering: higher score comes first in PriorityBlockingQueue.
     */
    @Override
    public int compareTo(Incident other) {
        if (other == null) return -1;
        return Double.compare(other.priorityScore != null ? other.priorityScore : 0.0,
                              this.priorityScore != null ? this.priorityScore : 0.0);
    }
}
