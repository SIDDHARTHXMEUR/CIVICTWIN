package com.civictwin.exception;

/**
 * Java Concept: Custom Exception Classes & Inheritance from RuntimeException.
 * Thrown when lat/lon coordinates exceed valid WGS84 ranges.
 */
public class InvalidLocationException extends RuntimeException {
    public InvalidLocationException(String message) {
        super(message);
    }
}
