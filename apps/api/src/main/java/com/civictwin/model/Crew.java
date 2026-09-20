package com.civictwin.model;

import com.civictwin.enums.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Spatial Resource Entity & Greedy Allocation.
 * Represents municipal emergency response crew units (e.g. Water Rapid Response, Traffic Police).
 */
@Entity
@Table(name = "crews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Crew {

    @Id
    private String id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Category specialty;

    @Embedded
    private Location location;

    private String status = "IDLE"; // IDLE, DISPATCHED, ON_SCENE

    private String assignedIncidentId;

    public Crew(String id, String name, Category specialty, Location location) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.location = location;
        this.status = "IDLE";
    }
}
