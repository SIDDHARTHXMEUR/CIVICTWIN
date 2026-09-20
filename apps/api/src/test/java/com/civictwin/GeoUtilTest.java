package com.civictwin;

import com.civictwin.util.GeoUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoUtilTest {

    @Test
    @DisplayName("Test Haversine Distance between Jaipur landmarks")
    void testHaversineDistance() {
        // Mansarovar Substation -> MI Road Junction (approx 4.2 km)
        double dist = GeoUtil.haversineDistanceMeters(26.9124, 75.7873, 26.9197, 75.7857);

        assertTrue(dist > 500.0, "Distance between distinct landmarks should be > 500m");
        assertTrue(dist < 5000.0, "Distance between nearby Jaipur nodes should be < 5km");
    }

    @Test
    @DisplayName("Test Haversine Zero Distance for identical points")
    void testHaversineZeroDistance() {
        double dist = GeoUtil.haversineDistanceMeters(26.9124, 75.7873, 26.9124, 75.7873);
        assertTrue(dist < 1e-6, "Distance to self should be 0");
    }
}
