package com.civictwin.exception;

/**
 * Java Concept: Custom Exception Classes & Business Validation.
 * Thrown when a duplicate incident report is submitted.
 */
public class DuplicateReportException extends RuntimeException {
    public DuplicateReportException(String message) {
        super(message);
    }
}
