# CivicTwin
### Municipal Urban Operational Layer, Spatial Digital Twin & Spring Boot Backend

<p align="center">
  <em>See the city. Predict the risk. Act before it escalates.</em>
</p>

<p align="center">
  <a href="https://github.com/SIDDHARTHXMEUR/CIVICTWIN"><strong>📂 GitHub Repository</strong></a>
</p>

---

> [!IMPORTANT]
> **CivicTwin** is an open-source municipal operations and spatial intelligence platform that unifies fragmented urban telemetry, public grievances, and GIS spatial layers into a single real-time operational layer. It features a modern **React 19 + TypeScript + Vite + Zustand + Leaflet** web frontend powered by a robust **Java 21 / Spring Boot 3.x** backend (`apps/api`).

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture & Java Backend](#-system-architecture--java-backend)
- [Java Practical Concepts Mapping](#-java-practical-concepts-mapping)
- [The Problem: Fragmented City Signals](#-the-problem-fragmented-city-signals)
- [Product Model: The Operational Loop](#-product-model-the-operational-loop)
- [Core Capabilities & System Features](#-core-capabilities--system-features)
- [Design System & Mission Control Typography](#-design-system--mission-control-typography)
- [Full Technology Stack](#-full-technology-stack)
- [Backend API Specification](#-backend-api-specification)
- [Quick Start Guide](#-quick-start-guide)

---

## 🏛️ Executive Overview

Municipal control centers historically operate in isolated, disconnected silos:
- **Citizen grievances** trickle in through disjointed portals, helplines, and social queues.
- **SCADA pressure & hydraulic sensors** broadcast raw telemetry to isolated engineering stations.
- **Transit and traffic signals** feed separate regional monitoring consoles.
- **Field response crews** coordinate via ad-hoc radio chatter and cell phone calls.

When critical urban infrastructure breaks, municipal operators waste precious minutes manually connecting the dots across disparate dashboards.

**CivicTwin provides the missing operational layer between what a city observes and what a city does:**
1. **Synchronizes Urban Signals**: Consolidates citizen geotagged grievances, 144 IoT telemetry sensors, and multi-layer GIS into one unified tactical cockpit.
2. **Predicts Failure Cascades**: Evaluates spatial anomaly propagation vectors and severity with transparent, rule-based scoring (1–10 scale).
3. **Surfaces Contextual Decisions**: Recommends immediate tactical interventions through an actionable, high-contrast **Decision Rail**.
4. **Dispatches Autonomous Crews**: Computes shortest-path emergency routes using simulated **Vehicle Routing with Time Windows (VRPTW)**.
5. **DBSCAN Hotspot Detection**: Spatial cluster analysis identifies emerging hazard clusters.
6. **Automated Report Deduplication**: Automatically merges citizen reports within a 500-meter Haversine radius into existing incidents.

---

## 🏗️ System Architecture & Java Backend

CivicTwin is structured as a multi-package monorepo:
- **`apps/web`**: React 19, TypeScript, Vite, Zustand, TailwindCSS, Leaflet GIS.
- **`apps/api`**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Spring Security (JWT), Spring WebSocket (STOMP), H2 / MySQL, JUnit 5, Mockito.

```
                  +-----------------------------------+
                  |   CivicTwin Web Frontend (Vite)   |
                  |     React 19 + Zustand + Leaflet  |
                  +-----------------+-----------------+
                                    | REST / WebSocket (STOMP)
                                    v
                  +-----------------------------------+
                  |    CivicTwin Spring Boot API      |
                  |              (apps/api)           |
                  +-----------------+-----------------+
                                    |
     +-----------------+------------+------------+-----------------+
     |                 |                         |                 |
     v                 v                         v                 v
[Controllers]     [Services]               [Schedulers]      [Security]
REST API &        Incident, Merge,          SensorSim (2s),   JWT Filter,
WebSocket         Severity, Dispatch,       SLA Watcher       CITIZEN /
/topic/telemetry  Hotspot DBSCAN                              OFFICER Roles
```

---

## 🎓 Java Practical Concepts Mapping

This repository is designed for college practical submissions, demonstrating core Object-Oriented Programming (OOP), Data Structures, Design Patterns, Concurrency, Database Access, and Enterprise Web Development concepts in Java 21 and Spring Boot 3.x.

| Java / CS Concept | Implementation Class(es) in `apps/api` | Description & Key Code Highlights |
| :--- | :--- | :--- |
| **Class Hierarchy & Polymorphism** | `Incident` (abstract), `WaterIncident`, `TrafficIncident`, `AqiIncident`, `RoadHazardIncident`, `InfrastructureIncident` | Abstract base class `Incident` extended by domain-specific incident models overriding `getCategoryImpact()`. |
| **Strategy Pattern** | `SeverityStrategy` (interface), `RuleBasedSeverity` (class), `SeverityEngine` (service) | Decouples severity calculation logic. Allows interchangeable scoring strategies at runtime. |
| **Command Pattern** | `IncidentCommand` (interface), `DispatchCommand`, `EscalateCommand`, `ResolveCommand`, `VerifyCommand` | Encapsulates incident mitigation operations as executable command objects with audit logging. |
| **Observer Pattern** | `TelemetryService`, `SensorSimulator`, `WebSocketConfig` | Sensor simulator pushes telemetry state to subscribed WebSocket clients over `/topic/telemetry` and `/topic/alerts`. |
| **Collections & Priority Queue** | `DecisionRail` in `IncidentService`, `PriorityBlockingQueue<Incident>` | Maintains pending incidents ordered by calculated composite severity score for operator triage. |
| **Spatial Algorithms & Clustering** | `HotspotService` (hand-written DBSCAN implementation without external libs) | Custom Spatial DBSCAN algorithm scanning active incident coordinates (`haversine`) to determine city risk state (NORMAL, EMERGING, CRITICAL). |
| **Concurrency & Threading** | `SensorSimulator`, `ScheduledExecutorService`, `ConcurrentHashMap` | Background daemon thread executing 2-second telemetry updates with thread-safe registry synchronization. |
| **Java Streams API & Lambdas** | `AnalyticsService`, `IncidentService` | Declarative aggregation for KPI indicators, badge counts, and domain filtering using `.stream()`, `.filter()`, `.map()`, `.collect()`. |
| **JDBC & Try-with-Resources** | `IncidentJdbcRepository` | Manual SQL query execution using plain `PreparedStatement`, `ResultSet`, and `AutoCloseable` resource management for database practical requirements. |
| **Spring Data JPA & ORM** | `IncidentRepository`, `SensorRepository`, `CrewRepository`, `UserRepository`, `AuditEventRepository` | High-level object-relational mapping with derived query methods (`findByStatus`, `findActiveWithinRadius`). |
| **Global Exception Handling** | `GlobalExceptionHandler` (`@ControllerAdvice`), `InvalidLocationException`, `DuplicateReportException` | Centralized REST error handling converting domain exceptions into standardized JSON HTTP responses. |
| **Spring Security & JWT** | `JwtAuthenticationFilter`, `SecurityConfig`, `JwtTokenProvider` | Role-Based Access Control (RBAC) protecting officer actions (`OFFICER`) while leaving intake public (`CITIZEN`). |

---

## 💻 Full Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **State Management** | Zustand (Internal state wired to Java API) |
| **GIS & Mapping** | Leaflet, React-Leaflet, OpenStreetMap, CARTO Dark/Positron/Satellite tiles |
| **Styling & Theme** | Vanilla CSS, TailwindCSS, Hanken Grotesk, JetBrains Mono |
| **Backend Framework** | Java 21, Spring Boot 3.3.4 |
| **Database Access** | Spring Data JPA + Plain JDBC (`IncidentJdbcRepository`) |
| **Databases** | H2 Database (in-memory dev profile), MySQL driver (profile "mysql") |
| **Security & Auth** | Spring Security 6, JWT (JSON Web Tokens) |
| **Realtime Messaging** | WebSocket with STOMP broker (`/topic/telemetry`, `/topic/alerts`) |
| **API Documentation** | springdoc-openapi (Swagger UI at `/swagger-ui.html`) |
| **Testing** | JUnit 5, Mockito, Spring Boot MockMvc |

---

## 📡 Backend API Specification

Base URL: `http://localhost:8080` (or proxied via Vite dev server at `/api`).

### Incidents (`/api/incidents`)
- `GET /api/incidents`: Fetch active or filtered incidents (`?status=RESOLVED&since=today`).
- `POST /api/incidents`: Submit new report. Performs 500m Haversine deduplication automatically.
- `POST /api/incidents/{id}/actions`: Execute officer command (`DISPATCH`, `RESOLVE`, `ESCALATE`, `VERIFY`).

### Sensors & Telemetry (`/api/sensors`)
- `GET /api/sensors`: List all 144 registered urban IoT sensors with predictive failure scores.
- `POST /api/sensors/{id}/ping`: Execute diagnostic ping and return ping ms / packet loss.

### Analytics & Hotspots (`/api/analytics`)
- `GET /api/analytics/summary`: Fetch aggregated city health index, active counts, and domain badges.
- `GET /api/analytics/hotspots`: Run DBSCAN spatial clustering and return risk state.

### Crews & Dispatch (`/api/crews`)
- `GET /api/crews`: List municipal response units and assigned incidents.

### Reports & Audits
- `GET /api/reports/daily.csv`: Export daily incident summary as CSV.
- `GET /api/audit`: Fetch append-only audit trail (`OFFICER` role required).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 21** JDK (or Java 17+)
- **Node.js** 18+ and **npm** 9+
- Maven wrapper (`mvnw.cmd` / `./mvnw`) included in repository

### Running the Full Platform (Frontend + Backend)

1. **Clone Repository & Install Frontend Dependencies**:
   ```bash
   git clone https://github.com/SIDDHARTHXMEUR/CIVICTWIN.git
   cd CIVICTWIN
   npm install
   ```

2. **Run Both Backend & Frontend Concurrently**:
   ```bash
   npm run dev
   ```
   This will launch:
   - **Java Spring Boot API**: `http://localhost:8080`
   - **React 19 Vite Web App**: `http://localhost:5173`
   - **Swagger OpenAPI Docs**: `http://localhost:8080/swagger-ui.html`

3. **Run Backend or Frontend Individually**:
   - Backend only: `npm run dev:api` (or `cd apps/api && ./mvnw spring-boot:run`)
   - Frontend only: `npm run dev:web`

4. **Run Backend Unit Tests**:
   ```bash
   cd apps/api
   ./mvnw test
   ```

### Demo Officer Login Credentials
- **Username**: `officer@civictwin.local`
- **Passkey**: `1234` (or demo password `officer123`)
