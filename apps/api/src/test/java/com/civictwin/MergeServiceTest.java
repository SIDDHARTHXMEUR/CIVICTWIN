package com.civictwin;

import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import com.civictwin.model.Location;
import com.civictwin.model.WaterIncident;
import com.civictwin.repository.IncidentRepository;
import com.civictwin.service.MergeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.BDDMockito.given;

class MergeServiceTest {

    @Test
    @DisplayName("Test 500m Merge Rule matches nearby active incident")
    void testMergeRuleMatch() {
        IncidentRepository repository = Mockito.mock(IncidentRepository.class);
        MergeService mergeService = new MergeService(repository);

        WaterIncident existing = new WaterIncident("INC-101", "Water Pipe Fracture", "Leak", new Location(26.9124, 75.7873, "Substation"), 8);
        existing.setStatus(Status.REPORTED);

        given(repository.findActiveIncidents()).willReturn(List.of(existing));

        // Submit new report 200m away (26.9140, 75.7873)
        Optional<Incident> match = mergeService.findNearbyActiveIncident(Category.WATER, 26.9140, 75.7873);

        assertTrue(match.isPresent(), "Report within 500m should merge into existing active incident");
    }
}
