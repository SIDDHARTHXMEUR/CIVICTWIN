package com.civictwin.controller;

import com.civictwin.service.AnalyticsService;
import com.civictwin.service.HotspotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Executive KPI & Spatial DBSCAN Hotspot Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final HotspotService hotspotService;

    public AnalyticsController(AnalyticsService analyticsService, HotspotService hotspotService) {
        this.analyticsService = analyticsService;
        this.hotspotService = hotspotService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get executive KPI summary and per-domain badge counts")
    public Map<String, Object> getSummary() {
        return analyticsService.getExecutiveSummary();
    }

    @GetMapping("/hotspots")
    @Operation(summary = "Get spatial DBSCAN hotspot clustering analytics")
    public Map<String, Object> getHotspots() {
        return hotspotService.analyzeHotspots();
    }
}
