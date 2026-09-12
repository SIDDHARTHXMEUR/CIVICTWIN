import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { randomJaipurCoord } from '../config/mapConfig';

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
  reportCount: number;
  lat?: number;
  lng?: number;
  updatedAt: number;
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
  addCitizenReport: (report: { category: string; description: string; photoUrl?: string; location: string }) => Promise<{ incident: Incident; merged: boolean }>;
  resolveIncident: (incidentId: string) => Promise<void>;
  dispatchIncident: (incidentId: string) => Promise<void>;
  pingNode: (nodeId: string) => void;
  recalibrateNode: (nodeId: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  focusedIncidentId: string | null;
  setFocusedIncidentId: (id: string | null) => void;
  loadFromSupabase: () => Promise<void>;
  loadFromSupabaseV2: () => Promise<void>;
  subscribeToRealtime: () => () => void;
  simulateAIPrediction: () => void;
  realtimeConnected: boolean;
  newIncidentAlert: string | null;
  clearNewIncidentAlert: () => void;
}

const now = Date.now();
const initialNodes: CityNode[] = [
  // === INFRASTRUCTURE (Water/Power) ===
  {
    id: "JP-W01", name: "Water Main Grid 7", lat: 26.9124, lng: 75.7873, domain: "infrastructure", status: "anomaly",
    scanFreqHz: 144, packetLoss: 4.8, pingMs: 14, assetType: "Acoustic Pressure Sensor V-14", locationName: "Mansarovar Sector 4 Substation",
    lastCalibrated: "2h ago", telemetryValue: "2.4 bar (PRESSURE DROP)"
  },
  {
    id: "JP-W05", name: "Mansarovar Water Node", lat: 26.8600, lng: 75.7750, domain: "infrastructure", status: "normal",
    scanFreqHz: 120, packetLoss: 0.3, pingMs: 18, assetType: "Ultrasonic Flowmeter W-05", locationName: "Mansarovar Main Grid",
    lastCalibrated: "5h ago", telemetryValue: "680 L/min (Normal)"
  },
  {
    id: "JP-W08", name: "C-Scheme Water Pump", lat: 26.9070, lng: 75.7970, domain: "infrastructure", status: "normal",
    scanFreqHz: 100, packetLoss: 0.6, pingMs: 15, assetType: "Smart Pump Controller W-08", locationName: "C-Scheme Pump Station",
    lastCalibrated: "1h ago", telemetryValue: "820 L/min (Optimal)"
  },
  {
    id: "JP-W09", name: "Tonk Road Pipeline", lat: 26.8750, lng: 75.7950, domain: "infrastructure", status: "warning",
    scanFreqHz: 110, packetLoss: 2.1, pingMs: 24, assetType: "Pressure Differential Sensor W-09", locationName: "Tonk Road Junction",
    lastCalibrated: "3h ago", telemetryValue: "3.1 bar (Minor Leak)"
  },
  {
    id: "JP-P10", name: "Jawahar Circle Power", lat: 26.8510, lng: 75.8060, domain: "infrastructure", status: "normal",
    scanFreqHz: 200, packetLoss: 0.2, pingMs: 9, assetType: "Smart Grid Meter P-10", locationName: "Jawahar Circle Substation",
    lastCalibrated: "30m ago", telemetryValue: "Load 72% (Stable)"
  },
  {
    id: "JP-P11", name: "Jhotwara Power Grid", lat: 26.9350, lng: 75.7550, domain: "infrastructure", status: "normal",
    scanFreqHz: 180, packetLoss: 0.4, pingMs: 12, assetType: "Transformer Monitor P-11", locationName: "Jhotwara Industrial Area",
    lastCalibrated: "2h ago", telemetryValue: "Load 58% (Low)"
  },

  // === MOBILITY (Traffic) ===
  {
    id: "JP-T02", name: "MI Road Traffic", lat: 26.9197, lng: 75.7857, domain: "mobility", status: "warning",
    scanFreqHz: 200, packetLoss: 2.8, pingMs: 22, assetType: "Radar Traffic Counter T-09", locationName: "MI Road Arterial Junction",
    lastCalibrated: "4h ago", telemetryValue: "1.8 km Bottleneck (DESYNC)"
  },
  {
    id: "JP-T04", name: "Ajmeri Gate Junction", lat: 26.9250, lng: 75.8191, domain: "mobility", status: "normal",
    scanFreqHz: 180, packetLoss: 0.5, pingMs: 16, assetType: "Inductive Vehicle Counter T-04", locationName: "Ajmeri Gate Substation",
    lastCalibrated: "3h ago", telemetryValue: "1,420 veh/hr (Optimal)"
  },
  {
    id: "JP-T07", name: "Sindhi Camp Transit Hub", lat: 26.9234, lng: 75.8025, domain: "mobility", status: "normal",
    scanFreqHz: 150, packetLoss: 0.5, pingMs: 15, assetType: "Transit Fleet Transponder T-07", locationName: "Sindhi Camp Bus Terminal",
    lastCalibrated: "6h ago", telemetryValue: "42 Buses Online"
  },
  {
    id: "JP-T12", name: "Hawa Mahal Corridor", lat: 26.9239, lng: 75.8267, domain: "mobility", status: "anomaly",
    scanFreqHz: 160, packetLoss: 3.5, pingMs: 28, assetType: "Camera + Radar Fusion T-12", locationName: "Hawa Mahal Road",
    lastCalibrated: "1h ago", telemetryValue: "2.3 km Queue (GRIDLOCK)"
  },
  {
    id: "JP-T13", name: "Amber Fort Access Road", lat: 26.9855, lng: 75.8513, domain: "mobility", status: "warning",
    scanFreqHz: 90, packetLoss: 1.8, pingMs: 35, assetType: "Solar Traffic Counter T-13", locationName: "Amber Fort Toll Plaza",
    lastCalibrated: "8h ago", telemetryValue: "Tourist Surge 340%"
  },
  {
    id: "JP-T14", name: "JLN Marg Flyover", lat: 26.8980, lng: 75.8100, domain: "mobility", status: "normal",
    scanFreqHz: 200, packetLoss: 0.3, pingMs: 10, assetType: "Magnetic Loop Detector T-14", locationName: "JLN Marg Flyover",
    lastCalibrated: "45m ago", telemetryValue: "1,890 veh/hr (Free Flow)"
  },
  {
    id: "JP-T15", name: "Durgapura Railway Crossing", lat: 26.8680, lng: 75.7880, domain: "mobility", status: "normal",
    scanFreqHz: 140, packetLoss: 0.7, pingMs: 19, assetType: "Level Crossing Sensor T-15", locationName: "Durgapura Railway Gate",
    lastCalibrated: "2h ago", telemetryValue: "Gate Open — Normal"
  },

  // === ENVIRONMENT (AQI / Noise / Flood) ===
  {
    id: "JP-E03", name: "AQI Sensor West", lat: 26.8924, lng: 75.7573, domain: "environment", status: "normal",
    scanFreqHz: 60, packetLoss: 1.2, pingMs: 11, assetType: "Laser Optical Particulate E-03", locationName: "Jaipur West Perimeter Gate",
    lastCalibrated: "1h ago", telemetryValue: "AQI 87 (Moderate)"
  },
  {
    id: "JP-E06", name: "Vaishali Nagar AQI", lat: 26.9100, lng: 75.7400, domain: "environment", status: "normal",
    scanFreqHz: 60, packetLoss: 0.8, pingMs: 12, assetType: "Multigas Sensor Array E-06", locationName: "Vaishali Nagar Sector 2",
    lastCalibrated: "2h ago", telemetryValue: "PM2.5: 38 µg/m³"
  },
  {
    id: "JP-E16", name: "Nahargarh AQI Station", lat: 26.9387, lng: 75.8155, domain: "environment", status: "anomaly",
    scanFreqHz: 60, packetLoss: 5.2, pingMs: 42, assetType: "CAAQMS Station E-16", locationName: "Nahargarh Fort Hill",
    lastCalibrated: "12h ago", telemetryValue: "AQI 287 (VERY POOR)"
  },
  {
    id: "JP-E17", name: "Walled City Noise Sensor", lat: 26.9260, lng: 75.8240, domain: "environment", status: "warning",
    scanFreqHz: 30, packetLoss: 1.5, pingMs: 14, assetType: "Acoustic dB Meter E-17", locationName: "Johari Bazaar",
    lastCalibrated: "4h ago", telemetryValue: "94 dB (EXCEEDS LIMIT)"
  },
  {
    id: "JP-E18", name: "Mansarovar Lake Monitor", lat: 26.8690, lng: 75.7620, domain: "environment", status: "normal",
    scanFreqHz: 20, packetLoss: 0.1, pingMs: 8, assetType: "Water Level + pH Sensor E-18", locationName: "Mansarovar Lake",
    lastCalibrated: "6h ago", telemetryValue: "Level 4.2m, pH 7.1"
  },
  {
    id: "JP-E19", name: "Sitapura Industrial AQI", lat: 26.8230, lng: 75.8390, domain: "environment", status: "warning",
    scanFreqHz: 60, packetLoss: 1.9, pingMs: 20, assetType: "Industrial Emission Monitor E-19", locationName: "Sitapura RIICO Industrial Area",
    lastCalibrated: "3h ago", telemetryValue: "SO₂: 82 µg/m³ (HIGH)"
  },
];

const initialKpis: KpiMetric[] = [
  { id: "city-health",   label: "City Health Index", value: 72, deltaPct:  0.4, deltaWindow: "1h", status: "good",    history: [40, 60, 55, 80, 70, 90, 85, 72, 75, 72] },
  { id: "air-quality",   label: "Air Quality (AQI)", value: 87, deltaPct: -1.2, deltaWindow: "2h", status: "good",    history: [80, 85, 82, 88, 85, 90, 87, 86, 88, 87] },
  { id: "mobility-flow", label: "Mobility Flow",      value: 68, deltaPct: -4.6, deltaWindow: "1h", status: "alert",   history: [80, 85, 78, 75, 70, 68, 65, 68, 70, 68] },
  { id: "water-grid",    label: "Water Grid Integrity", value: 84, deltaPct: -6.2, deltaWindow: "30m", status: "warning", history: [95, 94, 92, 90, 88, 86, 84, 85, 84, 84] },
  { id: "active-incidents", label: "Active Incidents", value: 8, deltaPct: 33.3, deltaWindow: "4h", status: "alert", history: [3, 4, 4, 5, 6, 5, 7, 6, 8, 8] },
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
    reportCount: 3, lat: 26.9124, lng: 75.7873, updatedAt: now - 3600000,
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
    reportCount: 5, lat: 26.9197, lng: 75.7857, updatedAt: now - 1800000,
  },
  {
    id: "INC-003",
    category: "mobility-gridlock",
    title: "Hawa Mahal Corridor Gridlock",
    description: "Camera-Radar fusion at JP-T12 detected 2.3 km stationary queue on Hawa Mahal Road. Pedestrian overflow into roadway.",
    severity: 9.0,
    impactPct: 78,
    confidencePct: 96,
    tab: "critical",
    linkedNodeId: "JP-T12",
    actions: [
      { label: "DEPLOY TRAFFIC POLICE", kind: "primary" },
      { label: "DIVERT VIA CHAURA RASTA", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Tourist season peak + unregulated street vendor encroachment narrowing effective lane width by 40%.",
    recommendedAction: "Deploy traffic police unit to Hawa Mahal Road, activate diversion via Chaura Rasta and Tripolia Bazaar.",
    reportCount: 12, lat: 26.9239, lng: 75.8267, updatedAt: now - 900000,
  },
  {
    id: "INC-004",
    category: "environment-air",
    title: "Nahargarh Hill AQI Emergency",
    description: "CAAQMS station JP-E16 reporting AQI 287 (Very Poor). PM2.5 at 4.7x safe limit. Wind carrying particulates towards Walled City.",
    severity: 8.8,
    impactPct: 72,
    confidencePct: 94,
    tab: "critical",
    linkedNodeId: "JP-E16",
    actions: [
      { label: "ISSUE PUBLIC ADVISORY", kind: "primary" },
      { label: "ACTIVATE SMOG GUNS", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Construction dust from Nahargarh Road widening project combined with thermal inversion trapping pollutants.",
    recommendedAction: "Halt construction activities, deploy mobile smog gun units, issue health advisory for Old City residents.",
    reportCount: 8, lat: 26.9387, lng: 75.8155, updatedAt: now - 2400000,
  },
  {
    id: "INC-005",
    category: "physical-infrastructure",
    title: "Tonk Road Pipeline Micro-Leak",
    description: "Pressure differential sensor JP-W09 detecting 0.7 bar anomaly. Estimated 120 L/hr loss on Tonk Road trunk line.",
    severity: 7.5,
    impactPct: 42,
    confidencePct: 87,
    tab: "warnings",
    linkedNodeId: "JP-W09",
    actions: [
      { label: "SCHEDULE REPAIR", kind: "primary" },
      { label: "MONITOR TREND", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Ageing joint seal degradation on 2018-installed HDPE trunk line section.",
    recommendedAction: "Schedule overnight repair crew. Monitor pressure delta trend — escalate to critical if >1.2 bar.",
    reportCount: 2, lat: 26.8750, lng: 75.7950, updatedAt: now - 7200000,
  },
  {
    id: "INC-006",
    category: "mobility-congestion",
    title: "Amber Fort Tourist Vehicle Surge",
    description: "Solar counter JP-T13 reporting 340% above baseline vehicle inflow at Amber Fort approach road.",
    severity: 7.2,
    impactPct: 55,
    confidencePct: 91,
    tab: "warnings",
    linkedNodeId: "JP-T13",
    actions: [
      { label: "ACTIVATE SHUTTLE", kind: "primary" },
      { label: "RESTRICT PRIVATE VEHICLES", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Weekend holiday + festival season driving peak tourist footfall to Amber Fort complex.",
    recommendedAction: "Activate JCTSL shuttle service from Sindhi Camp, restrict private vehicles beyond Jal Mahal checkpoint.",
    reportCount: 4, lat: 26.9855, lng: 75.8513, updatedAt: now - 5400000,
  },
  {
    id: "INC-007",
    category: "environment-noise",
    title: "Johari Bazaar Noise Violation",
    description: "Acoustic sensor JP-E17 sustained at 94 dB for 45+ minutes in commercial zone. CPCB limit: 65 dB.",
    severity: 6.8,
    impactPct: 38,
    confidencePct: 99,
    tab: "warnings",
    linkedNodeId: "JP-E17",
    actions: [
      { label: "NOTIFY ENFORCEMENT", kind: "primary" },
      { label: "LOG VIOLATION", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Unauthorized loudspeaker usage from multiple shops during peak market hours.",
    recommendedAction: "Dispatch noise enforcement team. Issue challan under CPCB noise regulation for commercial zones.",
    reportCount: 6, lat: 26.9260, lng: 75.8240, updatedAt: now - 3000000,
  },
  {
    id: "INC-008",
    category: "environment-industrial",
    title: "Sitapura SO₂ Emission Spike",
    description: "Industrial emission monitor JP-E19 reporting SO₂ at 82 µg/m³ — 64% above NAAQS 24-hr standard.",
    severity: 7.0,
    impactPct: 48,
    confidencePct: 92,
    tab: "insights",
    linkedNodeId: "JP-E19",
    actions: [
      { label: "NOTIFY RSPCB", kind: "primary" },
      { label: "REQUEST AUDIT", kind: "secondary" },
    ],
    status: "open",
    rootCause: "Suspected scrubber bypass at ceramic manufacturing unit in RIICO Phase-2.",
    recommendedAction: "Alert RSPCB for immediate factory inspection. Cross-reference with downwind AQI sensors for plume tracking.",
    reportCount: 1, lat: 26.8230, lng: 75.8390, updatedAt: now - 10800000,
  },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  kpis: initialKpis,
  incidents: initialIncidents,
  interactionLoop: { stage: "act", relatedIncidentId: "INC-001" },
  activeDomain: "all",
  theme: "light",
  isAuthenticated: false,
  focusedIncidentId: null,
  realtimeConnected: false,
  newIncidentAlert: null,

  setActiveDomain: (domain) => set({ activeDomain: domain }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  setIsAuthenticated: (auth: boolean) => set({ isAuthenticated: auth }),
  setFocusedIncidentId: (id) => set({ focusedIncidentId: id }),
  clearNewIncidentAlert: () => set({ newIncidentAlert: null }),

  subscribeToRealtime: () => {
    // Subscribe to civic_assets (legacy table) inserts
    const channel1 = supabase
      .channel('civic-assets-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'civic_assets' },
        (payload) => {
          const asset = payload.new as any;
          const newIncident: Incident = {
            id: asset.id,
            category: asset.domain,
            title: asset.title,
            description: asset.description || '',
            severity: asset.severity === 'critical' ? 9 : asset.severity === 'high' ? 7 : 4,
            impactPct: asset.severity === 'critical' ? 88 : 60,
            confidencePct: 94,
            tab: asset.severity === 'critical' ? 'critical' : 'warnings',
            status: 'open',
            reportCount: 1,
            lat: asset.latitude ?? 26.9124,
            lng: asset.longitude ?? 75.7873,
            updatedAt: Date.now(),
            actions: [
              { label: 'VERIFY', kind: 'primary' },
              { label: 'DISPATCH', kind: 'secondary' },
            ],
          };
          set((state) => ({
            incidents: [newIncident, ...state.incidents],
            newIncidentAlert: `🔴 LIVE: ${asset.title}`,
            interactionLoop: { stage: 'act', relatedIncidentId: asset.id },
          }));
        }
      )
      .subscribe((status) => {
        set({ realtimeConnected: status === 'SUBSCRIBED' });
      });

    // Subscribe to V2 incidents table (INSERT + UPDATE for lifecycle changes)
    const channel2 = supabase
      .channel('incidents-v2-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          const row = payload.new as any;
          const newIncident: Incident = {
            id: row.id,
            category: row.category,
            title: row.title,
            description: row.description || '',
            severity: row.severity_score / 10,
            impactPct: Math.round(row.severity_score * 0.9),
            confidencePct: 88,
            tab: (row.severity_band === 'critical' || row.severity_band === 'very_high') ? 'critical' : 'warnings',
            status: 'open',
            reportCount: row.report_count || 1,
            lat: row.latitude,
            lng: row.longitude,
            updatedAt: Date.now(),
            rootCause: row.root_cause,
            recommendedAction: row.recommended_action,
            actions: [
              { label: 'VERIFY', kind: 'primary' },
              { label: 'DISPATCH', kind: 'secondary' },
            ],
          };
          set((state) => ({
            incidents: [newIncident, ...state.incidents.filter(i => i.id !== row.id)],
            newIncidentAlert: `🔴 NEW INCIDENT: ${row.title}`,
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        (payload) => {
          const row = payload.new as any;
          set((state) => ({
            incidents: state.incidents.map(inc =>
              inc.id === row.id
                ? {
                    ...inc,
                    status: ['resolved', 'verified', 'closed'].includes(row.lifecycle_state) ? 'resolved' : 'open',
                    reportCount: row.report_count || inc.reportCount,
                    updatedAt: Date.now(),
                  }
                : inc
            ),
          }));
        }
      )
      .subscribe();

    // Subscribe to anomalies table (sensor-generated incidents)
    const channel3 = supabase
      .channel('anomalies-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'anomalies' },
        (payload) => {
          const row = payload.new as any;
          if (row.severity === 'high' || row.severity === 'critical') {
            set((state) => ({
              newIncidentAlert: `⚡ SENSOR ANOMALY: ${row.description || 'Threshold exceeded'} — z=${row.z_score?.toFixed(2)}`,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
      supabase.removeChannel(channel3);
    };
  },


  simulateAIPrediction: () => {
    const domains = ['infrastructure', 'mobility', 'environment'] as const;
    const titles = [
      'AI Predicted: Pipeline Pressure Anomaly',
      'AI Predicted: Traffic Surge — Festival Route',
      'AI Predicted: AQI Deterioration Detected',
      'AI Predicted: Water Supply Imbalance',
      'AI Predicted: Electrical Grid Overload Risk',
    ];
    const actions = [
      ['REROUTE FLOW', 'ALERT CREW'],
      ['DEPLOY TRAFFIC', 'NOTIFY TRANSIT'],
      ['ISSUE AQI ALERT', 'ACTIVATE SENSORS'],
    ];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const [lat, lng] = randomJaipurCoord();
    const domainActions = actions[Math.floor(Math.random() * actions.length)];
    const confidence = 75 + Math.floor(Math.random() * 20);
    const impact = 45 + Math.floor(Math.random() * 45);

    const newIncident: Incident = {
      id: `AI-${Date.now()}`,
      category: domain,
      title,
      description: `AI urban simulation engine identified a high-probability anomaly pattern in the ${domain} layer. Confidence: ${confidence}%. Immediate operator review recommended.`,
      severity: parseFloat((6 + Math.random() * 3).toFixed(1)),
      impactPct: impact,
      confidencePct: confidence,
      tab: impact > 70 ? 'critical' : 'warnings',
      linkedNodeId: undefined,
      actions: domainActions.map((label, i) => ({ label, kind: i === 0 ? 'primary' : 'secondary' as any })),
      status: 'open',
      reportCount: 1,
      lat, lng,
      updatedAt: Date.now(),
      rootCause: 'Detected via ML anomaly detection on sensor telemetry stream.',
      recommendedAction: 'Deploy field inspection unit and verify telemetry readings.',
    };

    set((state) => ({
      incidents: [newIncident, ...state.incidents],
      newIncidentAlert: `🤖 AI: ${title}`,
      interactionLoop: { stage: 'predict', relatedIncidentId: newIncident.id },
      kpis: state.kpis.map(k => {
        if (k.id === 'city-health') return { ...k, value: Math.max(k.value - 3, 40), deltaPct: -3.0, status: 'alert' as const };
        return k;
      }),
    }));
  },

  loadFromSupabase: async () => {
    // Legacy loader — kept for backward compat with civic_assets table
    try {
      const { data: assets, error } = await supabase.from('civic_assets').select('*');
      if (error || !assets?.length) {
        // Silently fall through to V2 loader
        return useStore.getState().loadFromSupabaseV2();
      }
      const loadedIncidents: Incident[] = assets
        .filter((a: any) => a.type !== 'sensor')
        .map((asset: any) => ({
          id: asset.id,
          category: asset.domain,
          title: asset.title,
          description: asset.description || '',
          severity: asset.severity === 'critical' ? 9 : asset.severity === 'high' ? 7 : 4,
          tab: asset.severity === 'critical' ? 'critical' : 'warnings',
          status: asset.status === 'resolved' ? 'resolved' : 'open',
          reportCount: 1,
          lat: asset.latitude,
          lng: asset.longitude,
          updatedAt: new Date(asset.created_at).getTime(),
          actions: [{ label: "VERIFY", kind: "primary" as const }, { label: "DISPATCH", kind: "secondary" as const }],
        }));
      if (loadedIncidents.length > 0) {
        set({ incidents: loadedIncidents });
      }
    } catch (e) {
      console.error("Failed to load from civic_assets:", e);
    }
    // Always try V2 as well
    return useStore.getState().loadFromSupabaseV2();
  },

  loadFromSupabaseV2: async () => {
    try {
      // Load full incidents from new V2 table
      const { data: incidentRows, error: incErr } = await supabase
        .from('incidents')
        .select('*')
        .order('severity_score', { ascending: false })
        .limit(50);

      if (!incErr && incidentRows && incidentRows.length > 0) {
        const v2Incidents: Incident[] = incidentRows.map((row: any) => ({
          id: row.id,
          category: row.category,
          title: row.title,
          description: row.description || '',
          severity: row.severity_score / 10, // normalize 0-100 → 0-10
          impactPct: Math.round(row.severity_score * 0.9),
          confidencePct: row.ai_confidence ? Math.round(row.ai_confidence * 100) : 88,
          tab: row.severity_band === 'critical' || row.severity_band === 'very_high' ? 'critical' : 'warnings',
          status: ['resolved', 'verified', 'closed'].includes(row.lifecycle_state) ? 'resolved' : 'open',
          reportCount: row.report_count || 1,
          lat: row.latitude,
          lng: row.longitude,
          updatedAt: new Date(row.updated_at || row.created_at).getTime(),
          rootCause: row.root_cause,
          recommendedAction: row.recommended_action,
          actions: [{ label: "VERIFY", kind: "primary" as const }, { label: "DISPATCH", kind: "secondary" as const }],
        }));
        set({ incidents: v2Incidents });
      }

      // Load sensors from new V2 table
      const { data: sensorRows, error: sErr } = await supabase
        .from('sensors')
        .select('*');

      if (!sErr && sensorRows && sensorRows.length > 0) {
        const v2Nodes: CityNode[] = sensorRows.map((row: any) => ({
          id: row.node_id,
          name: row.name,
          lat: row.latitude,
          lng: row.longitude,
          domain: (row.sensor_type.includes('water') ? 'infrastructure' :
                   row.sensor_type.includes('traffic') ? 'mobility' : 'environment') as any,
          status: row.status === 'anomaly' ? 'anomaly' : row.status === 'offline' ? 'warning' : 'normal',
          assetType: row.sensor_type,
          locationName: row.name,
        }));
        set({ nodes: v2Nodes });
      }
    } catch (e) {
      console.error("Failed V2 Supabase load:", e);
    }
  },


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
        reportCount: 1,
        lat: state.nodes.find(n => n.id === nodeId)?.lat || 26.9,
        lng: state.nodes.find(n => n.id === nodeId)?.lng || 75.8,
        updatedAt: Date.now(),
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

  addCitizenReport: async (report) => {
    let lat = 26.9197;
    let lng = 75.7857;
    const match = report.location.match(/(\d+\.\d+)°\s*[NS],\s*(\d+\.\d+)°\s*[EW]/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }

    let mappedCategory = "infrastructure";
    if (report.category.includes("Traffic") || report.category.includes("Road")) mappedCategory = "mobility";
    if (report.category.includes("AQI") || report.category.includes("Garbage")) mappedCategory = "environment";

    let resultIncident: Incident | null = null;
    let isMerged = false;

    // 1. Check local state for proximity merge (simplified for client-side demo)
    const existing = get().incidents.find(i => 
      i.status === "open" && 
      i.category.includes(mappedCategory) && 
      i.lat && i.lng && 
      getDistance(lat, lng, i.lat, i.lng) <= 500
    );

    let dbIncidentId = existing?.id;

    if (existing) {
      isMerged = true;
      resultIncident = {
        ...existing,
        reportCount: (existing.reportCount || 1) + 1,
        updatedAt: Date.now(),
        severity: Math.min(10, existing.severity + 0.2),
      };
      
      // Attempt Supabase Update
      if (!existing.id.startsWith('INC-')) {
        await supabase.from('incidents').update({ 
          report_count: resultIncident.reportCount,
          severity_score: resultIncident.severity * 10
        }).eq('id', existing.id);
      }
    } else {
      // Create new incident
      const title = `Citizen Report: ${report.category}`;
      const desc = `${report.description} (${report.location})`;
      
      const { data: incData, error: incErr } = await supabase.from('incidents').insert([{
        title: title,
        description: desc,
        category: mappedCategory,
        severity_score: 89,
        severity_band: 'high',
        lifecycle_state: 'reported',
        latitude: lat,
        longitude: lng,
        source: 'citizen_report',
        is_demo_data: true,
      }]).select().single();

      dbIncidentId = incData?.id || `INC-CIT-${Math.floor(Math.random() * 8999) + 1000}`;
      
      resultIncident = {
        id: dbIncidentId!,
        category: mappedCategory,
        title: title,
        description: desc,
        severity: 8.9,
        impactPct: 82,
        confidencePct: 94,
        tab: "critical",
        linkedNodeId: "JP-T04",
        actions: [
          { label: "VERIFY TELEMETRY", kind: "primary" },
          { label: "DISPATCH FIELD CREW", kind: "secondary" },
        ],
        status: "open",
        rootCause: "Citizen reported issue pending spatial verification.",
        recommendedAction: "Deploy municipal crew for field inspection.",
        reportCount: 1,
        lat, lng,
        updatedAt: Date.now()
      };
    }

    // Insert the report itself
    if (dbIncidentId && !dbIncidentId.startsWith('INC-')) {
      await supabase.from('incident_reports').insert([{
        incident_id: dbIncidentId,
        raw_text: report.description,
        latitude: lat,
        longitude: lng,
        photo_urls: report.photoUrl ? [report.photoUrl] : [],
      }]);
    }

    // Update local Zustand state
    set((state) => {
      const targetNodeId = "JP-T04";
      const updatedNodes = isMerged ? state.nodes : state.nodes.map(node =>
        node.id === targetNodeId ? { ...node, status: "anomaly" as NodeStatus, packetLoss: 6.2 } : node
      );
      
      const newIncidents = isMerged 
        ? state.incidents.map(i => i.id === existing?.id ? resultIncident! : i)
        : [resultIncident!, ...state.incidents];

      const updatedKpis = isMerged ? state.kpis : state.kpis.map(kpi => {
        if (kpi.id === "city-health") return { ...kpi, value: 65, deltaPct: -8.2, status: "alert" as const };
        if (kpi.id === "mobility-flow") return { ...kpi, value: 52, deltaPct: -18.5, status: "alert" as const };
        return kpi;
      });
      
      return {
        nodes: updatedNodes,
        incidents: newIncidents,
        interactionLoop: { stage: "act", relatedIncidentId: resultIncident!.id },
        kpis: updatedKpis,
      };
    });

    return { incident: resultIncident!, merged: isMerged };
  },

  resolveIncident: async (incidentId) => {
    // Attempt Supabase Update
    if (incidentId && !incidentId.startsWith('INC-')) {
      await supabase.from('incidents').update({ 
        lifecycle_state: 'resolved',
        resolved_at: new Date().toISOString()
      }).eq('id', incidentId);
    }

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

  dispatchIncident: async (incidentId) => {
    if (incidentId && !incidentId.startsWith('INC-')) {
      await supabase.from('incidents').update({ 
        lifecycle_state: 'dispatched',
        dispatched_at: new Date().toISOString()
      }).eq('id', incidentId);

      // Create a dummy dispatch record
      const teamsRes = await supabase.from('response_teams').select('id').limit(1).single();
      if (teamsRes.data) {
        await supabase.from('dispatches').insert([{
          incident_id: incidentId,
          team_id: teamsRes.data.id,
          status: 'dispatched',
          eta_minutes: 15
        }]);
      }
    }
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
