package com.civictwin;

import com.civictwin.model.Incident;
import com.civictwin.model.Location;
import com.civictwin.model.WaterIncident;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.PriorityBlockingQueue;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PriorityQueueTest {

    @Test
    @DisplayName("Test PriorityBlockingQueue Orders Incidents by Highest Priority Score")
    void testQueueOrdering() {
        PriorityBlockingQueue<Incident> queue = new PriorityBlockingQueue<>();

        WaterIncident low = new WaterIncident("INC-LOW", "Low Risk", "Desc", new Location(26.9, 75.7, "Loc"), 3);
        low.setPriorityScore(30.0);

        WaterIncident high = new WaterIncident("INC-HIGH", "High Risk", "Desc", new Location(26.9, 75.7, "Loc"), 9);
        high.setPriorityScore(95.0);

        queue.add(low);
        queue.add(high);

        Incident firstOut = queue.poll();
        assertEquals("INC-HIGH", firstOut.getId(), "Highest priority score incident must be dequeued first");
    }
}
