package com.civictwin;

import com.civictwin.model.Incident;
import com.civictwin.model.Location;
import com.civictwin.model.WaterIncident;
import com.civictwin.repository.IncidentRepository;
import com.civictwin.service.AuditService;
import com.civictwin.service.SlaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.mockito.BDDMockito.given;

class SlaWatcherTest {

    @Test
    @DisplayName("Test SLA Watcher Auto-Escalates Overdue Incidents")
    void testSlaEscalation() {
        IncidentRepository incidentRepository = Mockito.mock(IncidentRepository.class);
        AuditService auditService = Mockito.mock(AuditService.class);
        SlaService slaService = new SlaService(incidentRepository, auditService);

        WaterIncident overdue = new WaterIncident("INC-OLD", "Overdue Burst", "Pipe", new Location(26.91, 75.78, "Loc"), 8);
        overdue.setCreatedAt(System.currentTimeMillis() - (45 * 60 * 1000)); // 45 mins old (> 30m threshold)

        given(incidentRepository.findActiveIncidents()).willReturn(List.of(overdue));

        slaService.checkAndEscalateOverdue();

        Mockito.verify(incidentRepository).save(overdue);
        Mockito.verify(auditService).logEvent(Mockito.anyString(), Mockito.eq("AUTO_ESCALATE"), Mockito.eq("INC-OLD"), Mockito.anyString());
    }
}
