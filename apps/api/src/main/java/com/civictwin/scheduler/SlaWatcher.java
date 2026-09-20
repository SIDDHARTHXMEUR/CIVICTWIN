package com.civictwin.scheduler;

import com.civictwin.service.SlaService;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Java Concept: Spring Scheduled Tasks (@Scheduled) & SLA Enforcement.
 */
@Component
@EnableScheduling
public class SlaWatcher {

    private final SlaService slaService;

    public SlaWatcher(SlaService slaService) {
        this.slaService = slaService;
    }

    @Scheduled(fixedRate = 60000) // Runs every 60 seconds
    public void monitorSlaBreaches() {
        slaService.checkAndEscalateOverdue();
    }
}
