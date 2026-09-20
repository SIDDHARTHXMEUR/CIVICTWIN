package com.civictwin.model;

import com.civictwin.enums.Category;
import com.civictwin.enums.SensorStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Java Concept: Generic Collections, Encapsulation, and Predictive Trend Analysis.
 * Represents an IoT telemetry sensor streaming real-time operational metrics.
 */
@Entity
@Table(name = "sensors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sensor {

    @Id
    private String id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Embedded
    private Location location;

    @Enumerated(EnumType.STRING)
    private SensorStatus status = SensorStatus.NORMAL;

    private Double frequencyHz = 50.0;

    private Double packetLossPct = 0.05;

    private Integer diagnosticPingMs = 12;

    private Double lastReading = 0.0;

    private Double thresholdValue = 80.0;

    private Double predictiveFailureRisk = 0.05;

    @Transient
    private List<Double> recentReadings = new ArrayList<>();

    public Sensor(String id, String name, Category category, Location location, Double thresholdValue) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.location = location;
        this.thresholdValue = thresholdValue;
    }

    /**
     * Java Concept: Moving Average Calculation & Trend Analysis.
     * Computes failure risk score based on recent N readings.
     */
    public void addReading(double reading) {
        this.lastReading = reading;
        this.recentReadings.add(reading);
        if (this.recentReadings.size() > 10) {
            this.recentReadings.remove(0);
        }
        calculatePredictiveScore();
    }

    private void calculatePredictiveScore() {
        if (recentReadings.isEmpty()) {
            this.predictiveFailureRisk = 0.05;
            return;
        }
        double avg = recentReadings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double ratio = avg / (thresholdValue > 0 ? thresholdValue : 1.0);
        this.predictiveFailureRisk = Math.min(0.99, Math.max(0.01, ratio * 0.75));

        if (this.predictiveFailureRisk > 0.75) {
            this.status = SensorStatus.ANOMALY;
        } else if (this.predictiveFailureRisk > 0.45) {
            this.status = SensorStatus.WARNING;
        } else {
            this.status = SensorStatus.NORMAL;
        }
    }
}
