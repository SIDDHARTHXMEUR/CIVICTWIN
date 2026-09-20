package com.civictwin;

import com.civictwin.model.Incident;
import com.civictwin.model.Location;
import com.civictwin.model.WaterIncident;
import com.civictwin.repository.IncidentRepository;
import com.civictwin.service.HotspotService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DbscanTest {

    @Test
    @DisplayName("Test Hand-Implemented DBSCAN Spatial Clustering on Fixed Dataset")
    void testDbscanClustering() {
        IncidentRepository repository = Mockito.mock(IncidentRepository.class);
        HotspotService service = new HotspotService(repository);

        // Create a cluster of 3 incidents within 100m
        WaterIncident i1 = new WaterIncident("I1", "P1", "D1", new Location(26.9124, 75.7873, "Loc1"), 8);
        WaterIncident i2 = new WaterIncident("I2", "P2", "D2", new Location(26.9125, 75.7874, "Loc2"), 8);
        WaterIncident i3 = new WaterIncident("I3", "P3", "D3", new Location(26.9126, 75.7875, "Loc3"), 8);

        List<List<Incident>> clusters = service.dbscan(List.of(i1, i2, i3), 1000.0, 3);

        assertEquals(1, clusters.size(), "DBSCAN should detect 1 core spatial cluster");
        assertEquals(3, clusters.get(0).size(), "Cluster should contain all 3 proximate points");
    }
}
