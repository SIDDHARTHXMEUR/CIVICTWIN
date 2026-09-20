package com.civictwin.notifier;

import com.civictwin.model.Incident;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Java Concept: Polymorphic Implementation & Spring Dependency Injection.
 * Logs high-priority municipal notifications directly to the console stream.
 */
@Component
@Primary
public class ConsoleNotifier implements Notifier {

    @Override
    public void notifyEscalation(Incident incident, String recipient) {
        System.out.printf("[CONSOLE-NOTIFIER] Alert for %s -> Incident [%s] SEVERITY %d/10: %s%n",
                recipient, incident.getId(), incident.getSeverity(), incident.getTitle());
    }
}
