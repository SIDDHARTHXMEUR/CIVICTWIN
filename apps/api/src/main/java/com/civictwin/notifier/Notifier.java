package com.civictwin.notifier;

import com.civictwin.model.Incident;

/**
 * Java Concept: Interface Abstraction & Dependency Injection.
 * Declares the contract for multi-channel incident alert notifications.
 */
public interface Notifier {
    void notifyEscalation(Incident incident, String recipient);
}
