package com.civictwin.controller;

import com.civictwin.model.Sensor;
import com.civictwin.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
@Tag(name = "Sensors", description = "IoT Telemetry Sensor Registry Endpoints")
public class SensorController {

    private final TelemetryService telemetryService;

    public SensorController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping
    @Operation(summary = "Get all streaming telemetry sensors")
    public List<Sensor> getSensors() {
        return telemetryService.getAllSensors();
    }
}
