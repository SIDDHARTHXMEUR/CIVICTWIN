package com.civictwin.service;

import com.civictwin.enums.SensorStatus;
import com.civictwin.model.Sensor;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Java Concept: Multithreading, Concurrency, ScheduledExecutorService, & Observer Pattern.
 * Runs background telemetry simulation thread every 2 seconds, updates frequency, packet loss,
 * and diagnostic ping, then broadcasts live updates to WebSocket subscribers (/topic/telemetry).
 */
@Service
public class SensorSimulator {

    private final TelemetryService telemetryService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final Random random = new Random();

    public SensorSimulator(TelemetryService telemetryService, SimpMessagingTemplate messagingTemplate) {
        this.telemetryService = telemetryService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void startSimulation() {
        scheduler.scheduleAtFixedRate(this::tickSimulation, 2, 2, TimeUnit.SECONDS);
    }

    @PreDestroy
    public void stopSimulation() {
        scheduler.shutdown();
    }

    private void tickSimulation() {
        try {
            List<Sensor> sensors = telemetryService.getAllSensors();
            if (sensors.isEmpty()) return;

            for (Sensor sensor : sensors) {
                // Fluctuated telemetry metrics
                double delta = (random.nextDouble() - 0.48) * 4.0;
                double newReading = Math.max(0, sensor.getLastReading() + delta);
                sensor.setFrequencyHz(48.0 + random.nextDouble() * 4.0);
                sensor.setPacketLossPct(Math.round((0.02 + random.nextDouble() * 0.08) * 100.0) / 100.0);
                sensor.setDiagnosticPingMs(8 + random.nextInt(15));
                sensor.addReading(newReading);

                telemetryService.registerOrUpdate(sensor);
            }

            // Push Observer notification over WebSocket
            messagingTemplate.convertAndSend("/topic/telemetry", sensors);

            // Check for critical anomalies to push to /topic/alerts
            sensors.stream()
                    .filter(s -> s.getStatus() == SensorStatus.ANOMALY)
                    .findFirst()
                    .ifPresent(s -> messagingTemplate.convertAndSend("/topic/alerts",
                            "ALERT: Critical anomaly detected on sensor " + s.getName() + " (" + s.getId() + ")"));

        } catch (Exception e) {
            System.err.println("[SENSOR-SIMULATOR] Error in background tick: " + e.getMessage());
        }
    }
}
