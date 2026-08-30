import { create } from 'zustand';

export type NodeStatus = "normal" | "warning" | "anomaly";

export interface CityNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  domain: "infrastructure" | "mobility" | "environment";
  status: NodeStatus;
  scanFreqHz?: number;
  packetLoss?: number;
  pingMs?: number;
  assetType?: string;
  locationName?: string;
  lastCalibrated?: string;
  telemetryValue?: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  deltaPct: number;
  deltaWindow: string;
  status?: "good" | "alert" | "warning";
  history: number[];
}

export interface Incident {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: number;
  impactPct?: number;
  confidencePct?: number;
  tab: "critical" | "warnings" | "insights";
  linkedNodeId?: string;
  actions: { label: string; kind: "primary" | "secondary" }[];
  status: "open" | "resolved";
  rootCause?: string;
  recommendedAction?: string;
}

export interface InteractionLoopState {
  stage: "observe" | "predict" | "act";
  relatedIncidentId?: string;
}

interface AppState {
  nodes: CityNode[];
  kpis: KpiMetric[];
  incidents: Incident[];
  interactionLoop: InteractionLoopState;
  activeDomain: string;
  theme: "dark" | "light";
  setActiveDomain: (domain: string) => void;
  toggleTheme: () => void;
  triggerAnomaly: (nodeId: string, mockIncident: Partial<Incident>) => void;
  addCitizenReport: (report: { category: string; description: string; photoUrl?: string; location: string }) => Incident;
  resolveIncident: (incidentId: string) => void;
  pingNode: (nodeId: string) => void;
  recalibrateNode: (nodeId: string) => void;
}

const initialNodes: CityNode[] = [
  {
    id: "JP-W01", name: "Water Main Grid 7", lat: 26.9124, lng: 75.7873, domain: "infrastructure", status: "anomaly",
    scanFreqHz: 144, packetLoss: 4.8, pingMs: 14, assetType: "Acoustic Pressure Sensor V-14", locationName: "Mansarovar Sector 4 Substation",
    lastCalibrated: "2h ago", telemetryValue: "2.4 bar (PRESSURE DROP)"
  },
  {
    id: "JP-T02", name: "MI Road Traffic", lat: 26.9197, lng: 75.7857, domain: "mobility", status: "warning",
    scanFreqHz: 200, packetLoss: 2.8, pingMs: 22, assetType: "Radar Traffic Counter T-09", locationName: "MI Road Arterial Junction",
    lastCalibrated: "4h ago", telemetryValue: "1.8 km Bottleneck (DESYNC)"
  },
  {
    id: "JP-E03", name: "AQI Sensor West", lat: 26.8924, lng: 75.7573, domain: "environment", status: "normal",
    scanFreqHz: 60, packetLoss: 1.2, pingMs: 11, assetType: "Laser Optical Particulate E-03", locationName: "Jaipur West Perimeter Gate",
    lastCalibrated: "1h ago", telemetryValue: "AQI 87 (Moderate)"
  },
  {
    id: "JP-T04", name: "Ajmeri Gate Junction", lat: 26.9250, lng: 75.8191, domain: "mobility", status: "normal",
    scanFreqHz: 180, packetLoss: 0.5, pingMs: 16, assetType: "Inductive Vehicle Counter T-04", locationName: "Ajmeri Gate Substation",
    lastCalibrated: "3h ago", telemetryValue: "1,420 veh/hr (Optimal)"
  },
  {
    id: "JP-W05", name: "Mansarovar Water Node", lat: 26.8600, lng: 75.7750, domain: "infrastructure", status: "normal",
    scanFreqHz: 120, packetLoss: 0.3, pingMs: 18, assetType: "Ultrasonic Flowmeter W-05", locationName: "Mansarovar Main Grid",
    lastCalibrated: "5h ago", telemetryValue: "680 L/min (Normal)"
  },
  {
    id: "JP-E06", name: "Vaishali Nagar AQI", lat: 26.9100, lng: 75.7400, domain: "environment", status: "normal",
    scanFreqHz: 60, packetLoss: 0.8, pingMs: 12, assetType: "Multigas Sensor Array E-06", locationName: "Vaishali Nagar Sector 2",
    lastCalibrated: "2h ago", telemetryValue: "PM2.5: 38 µg/m³"
  },
  {
    id: "JP-T07", name: "Sindhi Camp Transit", lat: 26.9234, lng: 75.8025, domain: "mobility", status: "normal",
    scanFreqHz: 150, packetLoss: 0.5, pingMs: 15, assetType: "Transit Fleet Transponder T-07", locationName: "Sindhi Camp Terminal",
    lastCalibrated: "6h ago", telemetryValue: "42 Busses Online"
  },
];

const initialKpis: KpiMetric[] = [
  { id: "city-health",   label: "City Health Index", value: 72, deltaPct:  0.4, deltaWindow: "1h", status: "good",    history: [40, 60, 55, 80, 70, 90, 85, 72, 75, 72] },
  { id: "air-quality",   label: "Air Quality (AQI)", value: 87, deltaPct: -1.2, deltaWindow: "2h", status: "good",    history: [80, 85, 82, 88, 85, 90, 87, 86, 88, 87] },
  { id: "mobility-flow", label: "Mobility Flow",      value: 68, deltaPct: -4.6, deltaWindow: "1h", status: "alert",   history: [80, 85, 78, 75, 70, 68, 65, 68, 70, 68] },
];

const initialIncidents: Incident[] = [
  {
    id: "INC-001",
    category: "physical-infrastructure",
    title: "Water Main Pipe Fracture",
    description: "Sector 4, Mansarovar Substation. Severe pressure drop (4.8 bar delta) across Substation Node JP-W01.",
    severity: 9.2,
    impactPct: 85,
    confidencePct: 98,
    tab: "critical",
    linkedNodeId: "JP-W01",
    actions: [
      { label: "ISOLATE GRID", kind: "primary" },
      { label: "DISPATCH CREW", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Acoustic sensor drop indicates high-pressure pipe fracture at Substation Grid 7.",
    recommendedAction: "Isolate Valve V-14 and reroute water distribution through Secondary Grid 3B.",
  },
  {
    id: "INC-002",
    category: "mobility-gridlock",
    title: "MI Road Traffic Congestion & Signal Sync",
    description: "Unscheduled 1.8km bottleneck on MI Road Arterial Node JP-T02 causing signal timer desync.",
    severity: 8.4,
    impactPct: 64,
    confidencePct: 89,
    tab: "critical",
    linkedNodeId: "JP-T02",
    actions: [
      { label: "REROUTE TRAFFIC", kind: "primary" },
      { label: "NOTIFY TRANSIT", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Arterial volume surge combined with automated signal timer desynchronization.",
    recommendedAction: "Override junction JP-T02 signal sequence to green-wave & notify transit control.",
  },
  {
    id: "INC-003",
    category: "power-grid",
    title: "Ajmeri Gate Power Substation Surge",
    description: "Thermal overload detected at Ajmeri Gate Substation JP-T04. Risk of secondary transformer trip.",
    severity: 7.5,
    impactPct: 52,
    confidencePct: 94,
    tab: "warnings",
    linkedNodeId: "JP-T04",
    actions: [
      { label: "SHED LOAD", kind: "primary" },
      { label: "INSPECT SUBSTATION", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Peak load spike exceeding primary transformer rated thermal capacity by 14%.",
    recommendedAction: "Shed non-essential municipal grid load and dispatch electrical inspection unit.",
  },
];

export const useStore = create<AppState>((set) => ({
  nodes: initialNodes,
  kpis: initialKpis,
  incidents: initialIncidents,
  interactionLoop: { stage: "act", relatedIncidentId: "INC-001" },
  activeDomain: "all",
  theme: "dark",

  setActiveDomain: (domain) => set({ activeDomain: domain }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

  triggerAnomaly: (nodeId, mockIncident) => {
    set((state) => {
      const updatedNodes = state.nodes.map(node =>
        node.id === nodeId ? { ...node, status: "anomaly" as NodeStatus, packetLoss: 5.4 } : node
      );
      const newIncident: Incident = {
        id: `INC-${Math.floor(Math.random() * 9000) + 1000}`,
        category: mockIncident.category || "physical-infrastructure",
        title: mockIncident.title || "Detected Anomaly",
        description: mockIncident.description || "System detected anomalous readings.",
        severity: mockIncident.severity || 8.5,
        impactPct: mockIncident.impactPct || 85,
        confidencePct: mockIncident.confidencePct || 92,
        tab: mockIncident.tab || "critical",
        linkedNodeId: nodeId,
        actions: mockIncident.actions || [{ label: "Isolate System", kind: "primary" }],
        status: "open",
      };
      const updatedKpis = state.kpis.map(kpi => {
        if (kpi.id === "city-health")   return { ...kpi, value: 68, deltaPct: -5.7, status: "alert" as const };
        if (kpi.id === "mobility-flow") return { ...kpi, value: 55, deltaPct: -16.0, status: "alert" as const };
        return kpi;
      });
      return {
        nodes: updatedNodes,
        incidents: [newIncident, ...state.incidents],
        interactionLoop: { stage: "act", relatedIncidentId: newIncident.id },
        kpis: updatedKpis,
      };
    });
  },

  addCitizenReport: (report) => {
    const targetNodeId = "JP-T04"; // Link to Ajmeri Gate Junction node
    const newIncident: Incident = {
      id: `INC-CIT-${Math.floor(Math.random() * 8999) + 1000}`,
      category: "environmental-hazard",
      title: `Citizen Report: Drainage Overflow`,
      description: `${report.description} (${report.location})`,
      severity: 8.9,
      impactPct: 82,
      confidencePct: 94,
      tab: "critical",
      linkedNodeId: targetNodeId,
      actions: [
        { label: "VERIFY TELEMETRY", kind: "primary" },
        { label: "DISPATCH FIELD CREW", kind: "secondary" },
      ],
      status: "open",
      rootCause: "Stormwater drain blockage reported near Ajmeri Gate junction causing street runoff.",
      recommendedAction: "Deploy Zone 2 Municipal Drainage Crew to clear drain grates.",
    };

    set((state) => {
      const updatedNodes = state.nodes.map(node =>
        node.id === targetNodeId ? { ...node, status: "anomaly" as NodeStatus, packetLoss: 6.2 } : node
      );
      const updatedKpis = state.kpis.map(kpi => {
        if (kpi.id === "city-health") return { ...kpi, value: 65, deltaPct: -8.2, status: "alert" as const };
        if (kpi.id === "mobility-flow") return { ...kpi, value: 52, deltaPct: -18.5, status: "alert" as const };
        return kpi;
      });
      return {
        nodes: updatedNodes,
        incidents: [newIncident, ...state.incidents],
        interactionLoop: { stage: "act", relatedIncidentId: newIncident.id },
        kpis: updatedKpis,
      };
    });

    return newIncident;
  },

  resolveIncident: (incidentId) => {
    set((state) => {
      const incident = state.incidents.find(i => i.id === incidentId);
      if (!incident) return state;
      const updatedIncidents = state.incidents.map(i =>
        i.id === incidentId ? { ...i, status: "resolved" as const } : i
      );
      const updatedNodes = state.nodes.map(node =>
        node.id === incident.linkedNodeId ? { ...node, status: "normal" as NodeStatus, packetLoss: 0.1 } : node
      );
      const updatedLoop = state.interactionLoop.relatedIncidentId === incidentId
        ? { stage: "observe" as const }
        : state.interactionLoop;
      const updatedKpis = state.kpis.map(kpi => {
        if (kpi.id === "city-health")   return { ...kpi, value: 72, deltaPct: 0.4, status: "good" as const };
        if (kpi.id === "mobility-flow") return { ...kpi, value: 68, deltaPct: -4.6, status: "alert" as const };
        return kpi;
      });
      return { incidents: updatedIncidents, nodes: updatedNodes, interactionLoop: updatedLoop, kpis: updatedKpis };
    });
  },

  pingNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, pingMs: Math.floor(Math.random() * 8) + 8, scanFreqHz: (node.scanFreqHz || 120) + (Math.random() > 0.5 ? 2 : -2) }
          : node
      )
    }));
  },

  recalibrateNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, packetLoss: 0.1, lastCalibrated: "Just now" }
          : node
      )
    }));
  },
}));
