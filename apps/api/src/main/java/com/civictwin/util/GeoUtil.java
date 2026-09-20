package com.civictwin.util;

/**
 * Java Concept: Static Utility Methods & Mathematical Formulas.
 * Implements the Haversine formula to compute great-circle distance (in meters)
 * between two geographic coordinates on Earth.
 */
public class GeoUtil {

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private GeoUtil() {
        // Private constructor for static utility class
    }

    /**
     * Calculates distance in meters between two lat/lon coordinates using Haversine formula.
     */
    public static double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }
}
