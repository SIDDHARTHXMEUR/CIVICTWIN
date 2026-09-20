# CivicTwin
### Municipal Urban Operations & Spatial Intelligence Platform

<p align="center">
  <em>See the city. Predict the risk. Act before it escalates.</em>
</p>

<p align="center">
  <a href="https://civictwin.vercel.app"><strong>🌐 Live Web App (Vercel)</strong></a> &nbsp;•&nbsp;
  <a href="https://github.com/SIDDHARTHXMEUR/CIVICTWIN"><strong>📂 GitHub Repository</strong></a> &nbsp;•&nbsp;
  <a href="http://localhost:8080/swagger-ui.html"><strong>⚡ Swagger API Docs</strong></a>
</p>

---

> [!IMPORTANT]
> **CivicTwin** is an open-source municipal operations and spatial intelligence platform designed to transform fragmented urban signals into actionable operational intelligence. It connects citizen geotagged reports, IoT telemetry, GIS data, spatial algorithms, and emergency response teams into a unified real-time operational layer. It features a modern **React 19 + TypeScript + Vite + Zustand + Leaflet** web app powered by a robust **Java 21 / Spring Boot 3.3.4** backend (`apps/api`).

---

## 📌 Overview

Modern cities generate enormous amounts of information through:
- **Citizen complaints** and public grievances
- **IoT & infrastructure telemetry sensors** (SCADA water pressure, AQI, traffic loop detectors, power grid)
- **Traffic and mobility monitoring systems**
- **Environmental indicators**
- **GIS and spatial datasets**
- **Municipal field-response teams**

The problem is not the lack of data. **The problem is that these signals exist in separate, disconnected systems.**

CivicTwin creates a unified operational layer that connects these signals, identifies spatial patterns, prioritizes incidents using transparent rule-based severity scoring, recommends tactical actions via a high-contrast Decision Rail, and coordinates field response units.

### Core Operational Loop
$$\text{OBSERVE} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{ACT} \longrightarrow \text{VERIFY}$$

---

## 📑 Table of Contents
- [Executive Overview](#-overview)
- [Why CivicTwin?](#-why-civictwin)
- [Key Capabilities](#-key-capabilities)
- [How the System Works](#-how-the-system-works)
- [System Architecture](#-system-architecture)
- [Java & Spring Boot Engineering](#-java--spring-boot-engineering)
- [Java Practical Concepts Mapping](#-java-practical-concepts)
- [Spatial Intelligence](#-spatial-intelligence)
- [Technology Stack](#-technology-stack)
- [Backend API Specification](#-backend-api)
- [Project Structure](#-project-structure)
- [Quick Start Guide](#-quick-start)
- [Demo Credentials](#-demo-credentials)
- [Future Development](#-future-development)

---

## 🏙️ Why CivicTwin?

Municipal control centers frequently operate across disconnected systems.

### Traditional Disconnected Workflow
```
Citizen Reports    ───► Municipal Portal / Helpline / Social Media
IoT Sensors        ───► Isolated SCADA & Sensor Dashboard
Traffic Systems    ───► Separate Mobility Control Room
GIS Datasets       ───► Offline Desktop Mapping Software
Response Teams     ───► Manual Radio Chatter & Cell Calls
```
*Result: Severe operational delay between what the city observes and what it can actually act upon.*

### CivicTwin's Unified Approach
```
┌─────────────────────┐
│   Citizen Reports   │
└──────────┬──────────┘
           │
 ┌─────────┴────┐   ┌──────────────┐   ┌───────────────┐
 │  IoT Sensors │───┤  CivicTwin   ├───│ GIS / Spatial │
 └──────────────┘   │ Core Layer   │   └───────────────┘
                    └──────┬───────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
 Detect Anomaly    Prioritize Urgency    Recommend Action
      │                    │                    │
      └────────────────────┼────────────────────┘
                           │
                           ▼
                  Dispatch Field Crews
                           │
                           ▼
                     Verify Outcome
```

---

## ⚡ Key Capabilities

### 1. Unified Urban Telemetry
CivicTwin combines multiple urban signals into a single operational interface:
- Citizen-submitted geotagged incidents
- 144 simulated IoT telemetry sensors (Water pressure, Traffic flow, AQI, Grid load)
- Infrastructure condition indicators
- Traffic & mobility signals
- Spatial GIS layer with interactive Leaflet controls
- Municipal response crews

### 2. Incident Intelligence & Scoring
Every incident is dynamically evaluated using contextual signals:
- Incident category & geographic location
- Rule-based severity score (1–10 scale)
- Spatial anomaly propagation vectors
- Nearby sensor health & live telemetry thresholds

### 3. Spatial Hotspot Detection (DBSCAN)
CivicTwin implements a custom spatial **DBSCAN (Density-Based Spatial Clustering of Applications with Noise)** algorithm to detect geographic incident clusters.
The system calculates overall municipal spatial risk:
$$\text{NORMAL} \longrightarrow \text{EMERGING} \longrightarrow \text{CRITICAL}$$

### 4. Automated Incident Deduplication (Haversine 500m)
When multiple citizens report the same physical breakdown, CivicTwin calculates the geographic distance between reports using the **Haversine formula**.
- Reports submitted within a **500-meter radius** are automatically flagged and merged into an active master incident, preventing duplicate dispatch clutter.

### 5. Tactical Decision Rail
The operational cockpit features a high-contrast **Decision Rail** presenting real-time incident context and actionable operator controls (`DISPATCH`, `ESCALATE`, `RESOLVE`, `VERIFY`).

### 6. Emergency Crew Dispatch (VRPTW)
Models municipal response crews and calculates field response routing using simulated **Vehicle Routing Problem with Time Windows (VRPTW)** principles.

### 7. Real-Time Telemetry Stream (STOMP WebSockets)
A 2-second background simulation daemon generates live telemetry updates, pushed directly to connected clients over Spring WebSockets (`/topic/telemetry` & `/topic/alerts`).

---

## 🔄 How the System Works

CivicTwin executes a 5-stage operational pipeline:

```
01 — OBSERVE    ► Collect signals from citizen reports, IoT sensors, GIS layers, and mobility nodes.
02 — DETECT     ► Identify new anomalies, duplicate reports (500m Haversine), and spatial DBSCAN clusters.
03 — PRIORITIZE ► Calculate incident severity score (1-10), impact radius, and risk state.
04 — ACT        ► Command field dispatch, isolate grid nodes, or escalate to multi-agency response.
05 — VERIFY     ► Record append-only audit trail and update spatial twin node status.
```

---

## 🏗️ System Architecture

CivicTwin is structured as a clean multi-package monorepo:

```
CIVICTWIN/
│
├── apps/
│   ├── web/                     # React 19 Frontend
│   │   ├── src/components/      # Tactical UI Cockpit & Map Views
│   │   ├── src/store/           # Zustand Unified Operational Store
│   │   ├── src/api/             # REST & STOMP WebSocket Client
│   │   └── package.json
│   │
│   └── api/                     # Java 21 / Spring Boot 3.3.4 Backend
│       ├── src/main/java/       # Domain Models, Controllers, Services, JDBC
│       ├── src/test/java/       # JUnit 5 & Mockito Test Suite (9/9 Green)
│       └── pom.xml
│
├── package.json                 # Root script runner (npm run dev)
└── README.md
```

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     CIVICTWIN WEB APP                       │
│        React 19 + TypeScript + Zustand + Leaflet GIS        │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API / WebSockets (STOMP)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SPRING BOOT API — JAVA 21                   │
├─────────────────────────────────────────────────────────────┤
│  Controllers  ► Incident, Sensor, Crew, Analytics, Audit    │
│  Services     ► Severity, Deduplication, DBSCAN, Dispatch   │
│  Repositories ► Spring Data JPA + IncidentJdbcRepository    │
│  Security     ► Spring Security + JWT Authentication        │
│  Real-Time    ► ScheduledExecutorService (2s) + WebSockets  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                   H2 In-Memory / MySQL Database
```

---

## 🎓 Java Practical Concepts

This backend serves as an academic practical project, showcasing key Computer Science and Java 21 / Spring Boot engineering principles:

| CS / Java Concept | Implementation File(s) in `apps/api` | Javadoc Highlight & Practical Explanation |
| :--- | :--- | :--- |
| **OOP & Polymorphism** | `Incident`, `WaterIncident`, `TrafficIncident`, `AqiIncident` | Abstract base class `Incident` overridden by specialized incident subclasses calculating domain impact. |
| **Strategy Pattern** | `SeverityStrategy`, `RuleBasedSeverity`, `SeverityEngine` | Encapsulates severity scoring algorithms behind an interface for runtime strategy injection. |
| **Command Pattern** | `IncidentCommand`, `DispatchCommand`, `ResolveCommand`, `VerifyCommand` | Encapsulates operator mitigation actions as executable object instances. |
| **Observer Pattern** | `TelemetryService`, `SensorSimulator`, `WebSocketConfig` | Scheduled sensor simulator pushes live updates to WebSocket topic subscribers (`/topic/telemetry`). |
| **Priority Queue** | `PriorityBlockingQueue<Incident>` in `IncidentService` | Maintains active incidents ordered by composite severity for real-time operator triage. |
| **Spatial Clustering (DBSCAN)** | `HotspotService` | Custom spatial DBSCAN algorithm using Haversine distance to detect hazard clusters without external libraries. |
| **Concurrency & Threading** | `SensorSimulator`, `ScheduledExecutorService`, `ConcurrentHashMap` | Asynchronous thread updating sensor readings every 2s with thread-safe registry mapping. |
| **Streams API & Lambdas** | `AnalyticsService`, `IncidentService` | Filtering, mapping, and aggregate statistics calculation using Java 8+ Streams API (`.stream().filter()`). |
| **Plain JDBC & Resources** | `IncidentJdbcRepository` | Manual SQL query execution using `PreparedStatement`, `ResultSet`, and try-with-resources. |
| **Spring Data JPA & Security** | `IncidentRepository`, `SecurityConfig`, `JwtAuthenticationFilter` | Data persistence ORM + Role-Based Access Control (`CITIZEN` vs `OFFICER`). |

---

## 🧠 Spatial Intelligence

CivicTwin combines software engineering with geographic computation.

### Haversine Distance Calculation
Used for calculating exact surface distance between geographic coordinates:

$$d = 2r \arcsin \left( \sqrt{ \sin^2 \left( \frac{\Delta \phi}{2} \right) + \cos(\phi_1) \cos(\phi_2) \sin^2 \left( \frac{\Delta \lambda}{2} \right) } \right)$$

- **Distance < 500m**: Merged as potential duplicate report.
- **Distance > 500m**: Logged as independent spatial incident.

---

## 🧰 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **State Management** | Zustand (Unified local store synced with Java API) |
| **GIS & Mapping** | Leaflet, React-Leaflet, OpenStreetMap, CARTO Dark / Positron tiles |
| **Styling & Design System** | Vanilla CSS, TailwindCSS, Hanken Grotesk, JetBrains Mono |
| **Backend Framework** | Java 21, Spring Boot 3.3.4 |
| **Data Persistence** | Spring Data JPA + Plain JDBC (`IncidentJdbcRepository`) |
| **Database** | H2 Database (Dev profile), MySQL driver (Prod profile) |
| **Security & Auth** | Spring Security 6, JWT Tokens |
| **Realtime Messaging** | Spring WebSocket + STOMP Broker (`/topic/telemetry`, `/topic/alerts`) |
| **API Docs & Testing** | springdoc-openapi (Swagger UI), JUnit 5, Mockito, Spring MockMvc |
| **Build Tools** | Maven Wrapper (`mvnw`), npm |

---

## 📡 Backend API

Base URL: `http://localhost:8080` (or proxied via Vite dev server at `/api`).

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/incidents` | `GET` | Fetch active or status-filtered incidents (`?status=RESOLVED`) |
| `/api/incidents` | `POST` | Submit geotagged citizen report (runs 500m Haversine deduplication) |
| `/api/incidents/{id}/actions` | `POST` | Execute officer command (`DISPATCH`, `RESOLVE`, `ESCALATE`, `VERIFY`) |
| `/api/sensors` | `GET` | List all 144 registered urban IoT sensors and diagnostic scores |
| `/api/sensors/{id}/ping` | `POST` | Diagnostic ping for latency and packet loss metrics |
| `/api/analytics/summary` | `GET` | Aggregated city health index and domain indicators |
| `/api/analytics/hotspots` | `GET` | Run spatial DBSCAN clustering and return risk state |
| `/api/crews` | `GET` | List response units and assigned field incidents |
| `/api/reports/daily.csv` | `GET` | Export daily operational summary as CSV |
| `/api/audit` | `GET` | Return append-only operational audit trail |

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** JDK (or Java 17+)
- **Node.js** 18+ and **npm** 9+
- Maven wrapper (`./mvnw` / `mvnw.cmd`) included

### 1. Clone & Install
```bash
git clone https://github.com/SIDDHARTHXMEUR/CIVICTWIN.git
cd CIVICTWIN
npm install
```

### 2. Run Complete Application (Concurrent Web + Java API)
```bash
npm run dev
```
Access the application:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Spring Boot API**: [http://localhost:8080](http://localhost:8080)
- **Swagger OpenAPI Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### 3. Run Individual Components
- **Backend Only**: `npm run dev:api` (or `cd apps/api && ./mvnw spring-boot:run`)
- **Frontend Only**: `npm run dev:web`

### 4. Run Java Unit Test Suite
```bash
cd apps/api
./mvnw test
```

---

## 🔐 Demo Credentials

For municipal operator login demonstration:
- **Username**: `officer@civictwin.local`
- **Passkey / Password**: `1234` (or `officer123`)

---

## 🛣️ Future Development

- Production IoT broker integration (MQTT / Apache Kafka)
- Live municipal GIS layer ingestion (ArcGIS / GeoJSON feeds)
- Computer-vision-based road hazard detection
- Cloud serverless deployment & Kubernetes orchestration
- Mobile field-crew application (PWA / React Native)

---

## 🎯 Project Objective

CivicTwin demonstrates how a modern software platform can integrate:
`Java 21` + `Spring Boot` + `React 19` + `Leaflet GIS` + `Spatial Algorithms` + `STOMP WebSockets` + `Spring Security` into a single, cohesive operational system.

---

## 👨‍💻 Author

**Siddharth Meur**  
*B.Tech — Computer Science & Engineering (AI)*  
JECRC Foundation, Jaipur  
*GitHub*: [@SIDDHARTHXMEUR](https://github.com/SIDDHARTHXMEUR)

---
<p align="center">
  <strong>CivicTwin // Observe. Understand. Act. Verify.</strong>
</p>
