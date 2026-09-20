package com.civictwin.controller;

import com.civictwin.model.Incident;
import com.civictwin.repository.IncidentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

/**
 * Java Concept: File I/O Streams (java.io / java.nio) & Dynamic CSV Export.
 */
@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Municipal Operational Report Export Endpoints")
public class ReportController {

    private final IncidentRepository incidentRepository;

    public ReportController(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @GetMapping(value = "/daily.csv", produces = "text/csv")
    @Operation(summary = "Export daily municipal incident operational report in CSV format")
    public ResponseEntity<byte[]> generateDailyCsvReport() {
        List<Incident> incidents = incidentRepository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);

        // Header line
        writer.println("INCIDENT_ID,TITLE,CATEGORY,STATUS,SEVERITY,LATITUDE,LONGITUDE,REPORTS_COUNT,CREATED_AT");

        for (Incident inc : incidents) {
            double lat = inc.getLocation() != null && inc.getLocation().getLat() != null ? inc.getLocation().getLat() : 26.9124;
            double lng = inc.getLocation() != null && inc.getLocation().getLng() != null ? inc.getLocation().getLng() : 75.7873;
            writer.printf("%s,\"%s\",%s,%s,%d,%.5f,%.5f,%d,%s%n",
                    inc.getId(),
                    inc.getTitle() != null ? inc.getTitle().replace("\"", "'") : "",
                    inc.getCategory(),
                    inc.getStatus(),
                    inc.getSeverity() != null ? inc.getSeverity() : 5,
                    lat,
                    lng,
                    inc.getReportCount() != null ? inc.getReportCount() : 1,
                    Instant.ofEpochMilli(inc.getCreatedAt() != null ? inc.getCreatedAt() : System.currentTimeMillis()).toString()
            );
        }
        writer.flush();

        byte[] csvBytes = out.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"civictwin_daily_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
