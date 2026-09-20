package com.civictwin.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Value Objects & JPA @Embeddable components.
 * Encapsulates geographic coordinates (WGS84 lat/lon) and address descriptions.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    private Double lat;
    private Double lng;
    private String address;
}
