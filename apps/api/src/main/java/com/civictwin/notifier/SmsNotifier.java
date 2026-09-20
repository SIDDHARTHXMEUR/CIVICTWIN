package com.civictwin.notifier;

import com.civictwin.model.Incident;
import org.springframework.stereotype.Component;

/**
 * Java Concept: Concrete Interface Implementation (Mock SMS Channel).
 */
@Component("smsNotifier")
public class SmsNotifier implements Notifier {

    @Override
    public void notifyEscalation(Incident incident, String recipient) {
        System.out.printf("[MOCK-SMS] Sending SMS dispatch to %s for Incident %s%n",
                recipient, incident.getId());
    }
}
