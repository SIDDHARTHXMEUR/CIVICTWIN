package com.civictwin.controller;

import com.civictwin.enums.ActionType;
import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import com.civictwin.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Java Concept: RESTful Web Controllers, Request Body DTO Validation, & OpenAPI Annotations.
 */
@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incidents", description = "Municipal Incident Management & Decision Rail Endpoints")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    @Operation(summary = "Get active or filtered incidents")
    public List<Incident> getIncidents(@RequestParam(required = false) Status status,
                                        @RequestParam(required = false) String since) {
        if (Status.RESOLVED.equals(status) || "today".equalsIgnoreCase(since)) {
            return incidentService.getResolvedToday();
        }
        return incidentService.getAllActiveIncidents();
    }

    @PostMapping
    @Operation(summary = "Intake citizen report with 500m deduplication merge check")
    public ResponseEntity<Map<String, Object>> createIncident(@Valid @RequestBody IncidentCreateDTO dto) {
        Map<String, Object> result = incidentService.intakeReport(
                dto.getCategory(), dto.getTitle(), dto.getDescription(),
                dto.getLat(), dto.getLng(), dto.getLocation(), dto.getSeverity()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/actions")
    @Operation(summary = "Execute Decision Rail action on incident")
    public ResponseEntity<Incident> executeAction(@PathVariable String id,
                                                  @RequestBody ActionRequestDTO dto,
                                                  @RequestHeader(value = "X-Actor", required = false) String actor) {
        ActionType type = ActionType.valueOf(dto.getActionType().toUpperCase());
        Incident updated = incidentService.executeAction(id, type, actor != null ? actor : "OFFICER");
        return ResponseEntity.ok(updated);
    }

    @Data
    public static class IncidentCreateDTO {
        @NotBlank(message = "Category is required")
        private String category;

        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Latitude is required")
        private Double lat;

        @NotNull(message = "Longitude is required")
        private Double lng;

        private String location;
        private Integer severity = 5;
    }

    @Data
    public static class ActionRequestDTO {
        @NotBlank(message = "actionType is required")
        private String actionType;
    }
}
