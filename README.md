 # CIVICTWIN
### Municipal Urban Operational Layer & Spatial Digital Twin

> **See the city. Predict the risk. Act before it escalates.**

**CivicTwin** is a real-time municipal operations and spatial intelligence platform that transforms fragmented urban telemetry and citizen-reported incidents into a unified operational view of the city.

Built as a spatial digital twin for municipal command centers, CivicTwin combines live geographic visualization, incident intelligence, anomaly detection, telemetry monitoring, and rapid-response workflows into one operational layer.

It is designed around a simple principle:
> *Urban data is only valuable when it helps someone make a faster, better decision.*

---

## 01 — THE PROBLEM

Modern cities generate enormous amounts of operational data:
- Citizen complaints
- Road and traffic conditions
- Water infrastructure failures
- Environmental measurements
- IoT sensor telemetry
- Emergency incidents
- Spatial risk signals

But these signals are often fragmented across different systems. The result is a familiar municipal workflow:
```
Report → Verify → Locate → Prioritize → Dispatch → Resolve
```
**CivicTwin compresses this workflow into a unified spatial interface.**

Instead of asking *"Where are the problems?"*, municipal operators can ask:
> *"What is happening, where is it happening, how severe is it, and what should we do next?"*

---

## 02 — THE CIVICTWIN APPROACH

CivicTwin creates an operational digital representation of the city where every important signal has a spatial and operational context.

- **Observe**: Monitor incidents, infrastructure, environmental signals, and telemetry on a live spatial grid.
- **Predict**: Use severity classification and anomaly intelligence to identify emerging risks and prioritize incidents.
- **Act**: Convert intelligence into an operational response through rapid dispatch and incident-resolution workflows.

### The Operational Loop
```
┌──────────────┐
│   OBSERVE    │  • Telemetry
│              │  • Incidents
│              │  • City Signals
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   PREDICT    │  • Risk Score
│              │  • Severity
│              │  • Anomalies
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     ACT      │  • Dispatch
│              │  • Resolve
│              │  • Escalate
└──────┬───────┘
       │
       ▼
 CITY RESPONSE
```

---

## 03 — CORE CAPABILITIES

### Spatial Digital Twin
A continuously updated geographic representation of urban operational conditions.
The map encodes incident state through:
- Geographic position
- Severity rating
- Incident category
- Risk state
- Operational status
- Sensor telemetry

Operators can switch between **Satellite**, **Vector**, and **Topographic** map representations depending on the operational context.

### Citizen Incident Gateway
Citizens can report infrastructure problems directly into the municipal operational layer. Supported workflows include:
- Water leakage & pipe fractures
- Road hazards & drainage overflow
- Traffic bottlenecks & signal desync
- Environmental anomalies (AQI surges)
- Infrastructure failures

The reporting flow automatically captures:
```
Location → Incident Type → Severity → Evidence → Dispatch
```
GPS-based location tagging reduces the friction between discovering a problem and creating an actionable municipal incident. 
Additionally, the system features **Intelligent Report Merging**, automatically clustering identical reports within a 500m radius to prioritize corroborated issues and increment their report count without cluttering the operational layer.

### AI Severity & Risk Intelligence
Every incoming incident is evaluated through an intelligence layer that determines:
- Severity level & impact %
- Potential spatial relevance
- Escalation priority
- Recommended response strategy

### Municipal Command Center
The central operational interface allows operators to simultaneously monitor:
- City-wide incident distribution
- High-priority anomalies
- Spatial risk
- Sensor telemetry
- Emergency alerts & response actions
- **Live domain monitoring** via dynamic active incident count badges on the navigation sidebar

### Decision Rail
The Decision Rail converts intelligence into action. Instead of forcing an operator to navigate through multiple screens, high-priority incidents surface contextual actions directly inside the operational workspace. Alerts display real-time **Corroboration Metrics** (e.g., "REPORTED BY: 3"), relative timestamps, and non-clipping action buttons. A live **Resolved Today Log** ensures visibility into actively cleared issues.

Example workflow:
```
ANOMALY DETECTED → SEVERITY EVALUATED → OPERATOR ALERTED → RESPONSE ACTION → INCIDENT RESOLVED
```

### Telemetry Asset Registry
Municipal sensor assets can be inspected individually. Tracked metrics include:
| Metric | Purpose |
| :--- | :--- |
| **Frequency (Hz)** | Sensor reporting rate |
| **Packet Loss (%)** | Communication reliability |
| **Diagnostic Ping** | Device health & latency (ms) |
| **Location** | Spatial context & substation node |
| **Status** | Operational state (Normal, Warning, Anomaly) |

---

## 04 — PRODUCT ARCHITECTURE

```
                         CIVICTWIN
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
     ▼                       ▼                       ▼
CITIZEN LAYER       INTELLIGENCE LAYER       MUNICIPAL LAYER
 • Report Issue      • Risk Engine            • Command Center
 • GPS Location      • Severity               • Spatial Twin
 • Evidence          • Spatial Relevance      • Anomalies
 • Incident Type     • Prioritization         • Decision Rail
     │                       │                • Telemetry
     └───────────────────────┼───────────────────────┘
                             │
                             ▼
                       CITY RESPONSE
```

---

## 05 — APPLICATION MODULES

- **`Gateway.tsx` — Municipal Access & Incident Gateway**
  - Primary entry point into CivicTwin featuring role-based access, public reporting entry, officer login modal, spatial twin preview, system alerts drawer, and global quick search.
- **`CitizenApp.tsx` — Citizen Incident Reporting**
  - Public-facing incident submission interface with classification dropdowns, empty initial description field, automatic GPS tagging, AI severity matrix triage, and direct Command Center navigation.
- **`App.tsx` — Municipal Command Center**
  - Primary operations environment coordinating spatial intelligence, incident monitoring, risk analysis, and resolution workflows.
- **`GridTopologyPanel.tsx` — Spatial Digital Twin**
  - Interactive Leaflet-based geographic layer supporting Satellite/Vector/Topo basemaps, severity-encoded markers, spatial clustering, and the interactive Telemetry Asset Directory modal.
- **`IntelligencePanel.tsx` — Intelligence & Anomaly Resolution**
  - Implements the `OBSERVE → PREDICT → ACT` operational loop with live anomaly prioritization and one-click dispatch resolution.
- **`DecisionRail.tsx` — Emergency Decision Interface**
  - Contextual incident alert rail with non-clipping action buttons (`DISPATCH CREW`, `NOTIFY TRANSIT`, `VERIFY TELEMETRY`).

---

## 06 — DESIGN SYSTEM

CivicTwin follows a **Swiss Functionalist / International Typographic Style** rather than conventional dashboard aesthetics.

### Color System Tokens
| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Warm Sand** | `#F0EDE4` | Primary page background |
| **Card Surface** | `#F5F2E8` | Component containers |
| **Inset Surface** | `#E8E4D8` | Sub-containers & nested items |
| **Ink** | `#0A0A0A` | Primary typography & structural borders |
| **Civic Cyan** | `#4FC9DC` | Primary operational brand accent |
| **Critical Red** | `#EA3B1B` | Critical alerts and anomalies only |

### Design Principles
- No unnecessary gradients or decorative glassmorphism.
- Sharp 0px corners and strict grid discipline.
- No color without semantic purpose.
- Every visual element exists to communicate information or enable an action.

---

## 07 — WHY THE INTERFACE LOOKS DIFFERENT

CivicTwin intentionally avoids the typical *"dark background + neon gradients + glowing cards"* aesthetic. Instead, it uses an editorial, Swiss-inspired visual language:
- **Grid**: The city itself is treated as a structured information grid.
- **Typography**: Large, confident monospace & sans-serif typography create clear hierarchy.
- **Geometry**: Sharp edges and precise alignment reinforce operational control instrument character.
- **Color as Data**: `CYAN` = Operational/Active | `RED` = Critical Alert | `BLACK` = Structure | `SAND` = Canvas

---

## 08 — TECHNOLOGY STACK

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS / Vanilla CSS, Lucide React Icons
- **Spatial Layer**: Leaflet & React-Leaflet with CartoDB Satellite/Vector tiles
- **State Management**: Zustand
- **Typography**: `@fontsource/hanken-grotesk` & `@fontsource/jetbrains-mono`

---

## 09 — GETTING STARTED

### Prerequisites
- **Node.js**: `v18.0.0+`
- **npm**: `v9.0.0+`
- Modern Web Browser

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SIDDHARTHXMEUR/CIVICTWIN.git
   cd CIVICTWIN
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   *(No external API keys required — runs fully self-contained)*
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open CivicTwin**
   Navigate to `http://localhost:5173`.

---

## 10 — OPERATIONAL WORKFLOW

```
┌─────────────────────┐
│  CITIZEN / SENSOR   │
│       REPORT        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     GEOLOCATION     │
│   + INCIDENT DATA   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   SEVERITY / RISK   │
│   CLASSIFICATION    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    SPATIAL TWIN     │
│    VISUALIZATION    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      MUNICIPAL      │
│    DECISION RAIL    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ RESPONSE / DISPATCH │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     RESOLUTION      │
└─────────────────────┘
```

---

## 11 — EXAMPLE SCENARIO: WATER INFRASTRUCTURE FAILURE

1. **Report**: A citizen discovers a major water main pipe leak and opens CivicTwin.
2. **Locate**: GPS automatically attaches the exact geographic position (`26.9124, 75.7873`).
3. **Classify**: The incident is categorized under physical infrastructure with a 9.2 severity rating.
4. **Visualize**: The incident appears immediately on the municipal spatial grid as a pulsing red anomaly.
5. **Prioritize**: The intelligence layer evaluates the pressure drop against overall grid health.
6. **Act**: The command center Decision Rail receives an actionable alert.
7. **Dispatch**: The operator clicks `DISPATCH RESOLUTION →` or `ISOLATE GRID`.
8. **Resolve**: Spatial node returns to normal status, restoring City Health KPI.

---

## 12 — SECURITY & ACCESS MODEL

CivicTwin separates public incident reporting from municipal operational control:

- **Citizen Access**: `REPORT → LOCATION → INCIDENT DETAILS → SUBMIT`
- **Municipal Officer Access**: `AUTHENTICATE → MONITOR → ANALYZE → PRIORITIZE → DISPATCH → RESOLVE`

---

## 13 — PERFORMANCE PRINCIPLES

- Lightweight Leaflet spatial rendering
- Zero unnecessary re-renders via selective Zustand store subscriptions
- Minimal visual overhead & instant tab switching
- Reduced navigation path between information and dispatch action

---

## 14 — FUTURE ROADMAP

- **Phase 01 — Operational Foundation** *(Current)*: Incident management, spatial twin map, citizen reporting, municipal command center, telemetry asset directory.
- **Phase 02 — Intelligence**: Predictive infrastructure failure scoring, automated clustering, dynamic risk forecasting.
- **Phase 03 — City Integration**: Integration with municipal IoT sensor streams, traffic camera computer vision, water grid telemetry, and public grievance systems.
- **Phase 04 — Predictive City**: Transition from reactive response to proactive intervention (`SENSE → UNDERSTAND → PREDICT → INTERVENE → VERIFY`).

---

## 15 — IMPACT

- **Faster**: Shorter path from incident discovery to municipal dispatch.
- **Smarter**: Severity and risk scoring prioritize urgent hazards automatically.
- **More Transparent**: End-to-end operational lifecycle tracking from citizen report to resolution.
- **More Predictive**: Proactive monitoring prevents cascade infrastructure failures.

---

## 16 — PROJECT STRUCTURE

```
CIVICTWIN/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Gateway.tsx
│       │   │   ├── CitizenApp.tsx
│       │   │   ├── GridTopologyPanel.tsx
│       │   │   ├── IntelligencePanel.tsx
│       │   │   ├── DecisionRail.tsx
│       │   │   ├── KpiStrip.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── TopBar.tsx
│       │   ├── store/
│       │   │   └── index.ts
│       │   ├── App.tsx
│       │   └── index.css
│       ├── package.json
│       └── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 17 — PROJECT STATUS

**Current Status**: Active Development / Hackathon Prototype  
CivicTwin currently demonstrates the complete operational loop (*Citizen → Spatial Twin → Intelligence → Decision → Dispatch*).

---

## 18 — VISION

> *Cities already produce enormous amounts of data. The missing layer is often not another data source — it is the operational interface that connects data to decisions. CivicTwin is built to become that layer.*

**Built for Urban Intelligence**  
**CivicTwin** — Municipal Urban Operational Layer & Spatial Digital Twin  
*Observe → Predict → Act*

🔗 **GitHub Repository**: [https://github.com/SIDDHARTHXMEUR/CIVICTWIN](https://github.com/SIDDHARTHXMEUR/CIVICTWIN)
