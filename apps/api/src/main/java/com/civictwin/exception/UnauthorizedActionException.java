package com.civictwin.exception;

/**
 * Java Concept: Custom Exception Classes & Security Access Control.
 * Thrown when an unauthorized user attempts an officer-only decision action.
 */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
