package com.civictwin.config;

import com.civictwin.enums.Category;
import com.civictwin.enums.Role;
import com.civictwin.enums.SensorStatus;
import com.civictwin.model.*;
import com.civictwin.repository.CrewRepository;
import com.civictwin.repository.IncidentRepository;
import com.civictwin.repository.SensorRepository;
import com.civictwin.repository.UserRepository;
import com.civictwin.service.SeverityEngine;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Java Concept: Startup Seed Initialization (CommandLineRunner).
 * Seeds demo users, initial telemetry sensors, emergency response crews, and active incidents
 * centered around Jaipur (26.9124, 75.7873) matching exact initial state for 100% visual parity.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final SensorRepository sensorRepository;
    private final CrewRepository crewRepository;
    private final SeverityEngine severityEngine;

    public DataInitializer(UserRepository userRepository,
                           IncidentRepository incidentRepository,
                           SensorRepository sensorRepository,
                           CrewRepository crewRepository,
                           SeverityEngine severityEngine) {
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.sensorRepository = sensorRepository;
        this.crewRepository = crewRepository;
        this.severityEngine = severityEngine;
    }

    @Override
    public void run(String... args) {

        // 1. Seed Demo Officer User
        if (userRepository.findById("officer@civictwin.local").isEmpty()) {
            User officer = new User("officer@civictwin.local", "officer123", "Officer Commanding (Jaipur Control)", Role.OFFICER, true);
            userRepository.save(officer);
        }

        // 2. Seed Demo Crews
        if (crewRepository.count() == 0) {
            crewRepository.save(new Crew("CREW-W01", "Rapid Water Response Unit 1", Category.WATER, new Location(26.9100, 75.7800, "Mansarovar Depot")));
            crewRepository.save(new Crew("CREW-T01", "Traffic Police Mobile Unit 4", Category.TRAFFIC, new Location(26.9200, 75.7900, "MI Road Post")));
            crewRepository.save(new Crew("CREW-E01", "AQI Smog Mitigation Taskforce", Category.AQI, new Location(26.9350, 75.8100, "Nahargarh Base")));
            crewRepository.save(new Crew("CREW-I01", "Grid Power Recovery Team 2", Category.INFRASTRUCTURE, new Location(26.8600, 75.7700, "C-Scheme Base")));
        }

        // 3. Seed Demo Sensors
        if (sensorRepository.count() == 0) {
            seedSensors();
        }

        // 4. Seed Demo Incidents
        if (incidentRepository.count() == 0) {
            seedIncidents();
        }
    }

    private void seedSensors() {
        Sensor s1 = new Sensor("JP-W01", "Water Main Grid 7", Category.WATER, new Location(26.9124, 75.7873, "Mansarovar Sector 4 Substation"), 80.0);
        s1.setStatus(SensorStatus.ANOMALY);
        s1.setFrequencyHz(144.0);
        s1.setPacketLossPct(4.8);
        s1.setDiagnosticPingMs(14);
        s1.setLastReading(2.4);

        Sensor s2 = new Sensor("JP-T02", "MI Road Traffic", Category.TRAFFIC, new Location(26.9197, 75.7857, "MI Road Junction"), 85.0);
        s2.setStatus(SensorStatus.WARNING);
        s2.setFrequencyHz(200.0);
        s2.setPacketLossPct(2.8);
        s2.setDiagnosticPingMs(22);

        Sensor s3 = new Sensor("JP-T12", "Hawa Mahal Corridor", Category.TRAFFIC, new Location(26.9239, 75.8267, "Hawa Mahal Road"), 90.0);
        s3.setStatus(SensorStatus.ANOMALY);
        s3.setFrequencyHz(160.0);
        s3.setPacketLossPct(3.5);
        s3.setDiagnosticPingMs(28);

        Sensor s4 = new Sensor("JP-E16", "Nahargarh AQI Station", Category.AQI, new Location(26.9387, 75.8155, "Nahargarh Fort Hill"), 100.0);
        s4.setStatus(SensorStatus.ANOMALY);
        s4.setFrequencyHz(60.0);
        s4.setPacketLossPct(5.2);
        s4.setDiagnosticPingMs(42);

        Sensor s5 = new Sensor("JP-W09", "Tonk Road Pipeline", Category.WATER, new Location(26.8750, 75.7950, "Tonk Road Junction"), 75.0);
        s5.setStatus(SensorStatus.WARNING);
        s5.setFrequencyHz(110.0);
        s5.setPacketLossPct(2.1);
        s5.setDiagnosticPingMs(24);

        sensorRepository.saveAll(java.util.List.of(s1, s2, s3, s4, s5));
    }

    private void seedIncidents() {
        WaterIncident inc1 = new WaterIncident("INC-001", "Water Main Pipe Fracture",
                "Sector 4, Mansarovar Substation. Severe pressure drop (4.8 bar delta) across Substation Node JP-W01.",
                new Location(26.9124, 75.7873, "Mansarovar Sector 4 Substation"), 9);
        inc1.setReportCount(3);
        inc1.setRootCause("Acoustic sensor drop indicates high-pressure pipe fracture at Substation Grid 7.");
        inc1.setRecommendedAction("Isolate Valve V-14 and reroute water distribution through Secondary Grid 3B.");
        severityEngine.evaluateAndUpdate(inc1);

        TrafficIncident inc2 = new TrafficIncident("INC-002", "MI Road Traffic Congestion & Signal Sync",
                "Unscheduled 1.8km bottleneck on MI Road Arterial Node JP-T02 causing signal timer desync.",
                new Location(26.9197, 75.7857, "MI Road Arterial Junction"), 8);
        inc2.setReportCount(5);
        inc2.setRootCause("Arterial volume surge combined with automated signal timer desynchronization.");
        inc2.setRecommendedAction("Override junction JP-T02 signal sequence to green-wave & notify transit control.");
        severityEngine.evaluateAndUpdate(inc2);

        TrafficIncident inc3 = new TrafficIncident("INC-003", "Hawa Mahal Corridor Gridlock",
                "Camera-Radar fusion at JP-T12 detected 2.3 km stationary queue on Hawa Mahal Road.",
                new Location(26.9239, 75.8267, "Hawa Mahal Road"), 9);
        inc3.setReportCount(12);
        inc3.setRootCause("Tourist season peak + street vendor encroachment narrowing effective lane width by 40%.");
        inc3.setRecommendedAction("Deploy traffic police unit to Hawa Mahal Road, activate diversion via Chaura Rasta.");
        severityEngine.evaluateAndUpdate(inc3);

        AqiIncident inc4 = new AqiIncident("INC-004", "Nahargarh Hill AQI Emergency",
                "CAAQMS station JP-E16 reporting AQI 287 (Very Poor). PM2.5 at 4.7x safe limit.",
                new Location(26.9387, 75.8155, "Nahargarh Fort Hill"), 9);
        inc4.setReportCount(8);
        inc4.setRootCause("Construction dust from Nahargarh Road widening project combined with thermal inversion.");
        inc4.setRecommendedAction("Halt construction activities, deploy mobile smog gun units, issue health advisory.");
        severityEngine.evaluateAndUpdate(inc4);

        WaterIncident inc5 = new WaterIncident("INC-005", "Tonk Road Pipeline Micro-Leak",
                "Pressure differential sensor JP-W09 detecting 0.7 bar anomaly. Estimated 120 L/hr loss.",
                new Location(26.8750, 75.7950, "Tonk Road Junction"), 7);
        inc5.setReportCount(2);
        inc5.setRootCause("Ageing joint seal degradation on 2018-installed HDPE trunk line section.");
        inc5.setRecommendedAction("Schedule overnight repair crew. Monitor pressure delta trend.");
        severityEngine.evaluateAndUpdate(inc5);

        incidentRepository.saveAll(java.util.List.of(inc1, inc2, inc3, inc4, inc5));
    }
}
