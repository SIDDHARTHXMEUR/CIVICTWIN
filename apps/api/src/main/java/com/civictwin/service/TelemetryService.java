package com.civictwin.service;

import com.civictwin.model.Sensor;
import com.civictwin.repository.SensorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Java Concept: Thread-Safe Concurrent Collections (ConcurrentHashMap) & Telemetry Ingestion.
 * Maintains real-time sensor registry and moving-average predictive trend calculations.
 */
@Service
public class TelemetryService {

    private final SensorRepository sensorRepository;
    private final Map<String, Sensor> sensorRegistry = new ConcurrentHashMap<>();

    public TelemetryService(SensorRepository sensorRepository) {
        this.sensorRepository = sensorRepository;
    }

    public void registerOrUpdate(Sensor sensor) {
        sensorRegistry.put(sensor.getId(), sensor);
        sensorRepository.save(sensor);
    }

    public List<Sensor> getAllSensors() {
        if (sensorRegistry.isEmpty()) {
            List<Sensor> dbSensors = sensorRepository.findAll();
            dbSensors.forEach(s -> sensorRegistry.put(s.getId(), s));
        }
        return List.copyOf(sensorRegistry.values());
    }

    public Sensor getSensorById(String id) {
        return sensorRegistry.computeIfAbsent(id, k -> sensorRepository.findById(k).orElse(null));
    }
}
