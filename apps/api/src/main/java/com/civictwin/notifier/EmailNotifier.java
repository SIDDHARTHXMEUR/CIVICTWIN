package com.civictwin.notifier;

import com.civictwin.model.Incident;
import org.springframework.stereotype.Component;

/**
 * Java Concept: Concrete Interface Implementation (Mock Email Channel).
 */
@Component("emailNotifier")
public class EmailNotifier implements Notifier {

    @Override
    public void notifyEscalation(Incident incident, String recipient) {
        System.out.printf("[MOCK-EMAIL] Dispatching email to %s for Incident %s (%s)%n",
                recipient, incident.getId(), incident.getTitle());
    }
}
