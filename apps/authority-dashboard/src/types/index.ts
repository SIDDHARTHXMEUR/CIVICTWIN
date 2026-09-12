export interface Report {
  id: string;
  citizen_id?: string;
  raw_text?: string;
  photo_urls: string[];
  latitude: number;
  longitude: number;
  submitted_at: string;
  issue_type?: string;
  ai_summary?: string;
  severity_hint?: number;
  incident_id?: string;
  processing_status: string;
}

export interface InfrastructureImpact {
  infrastructure_id: string;
  name: string;
  category: string;
  distance_meters: number;
  latitude: number;
  longitude: number;
}

export interface InfrastructurePoint {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export interface Simulation {
  id: string;
  incident_id: string;
  horizon_hours: number;
  projected_affected_population: number;
  projected_traffic_disruption: string;
  projected_escalation_probability: number;
  reasoning: string;
  created_at: string;
}

export interface SeverityBreakdown {
  report_volume_score: number;
  citizen_reach_score: number;
  issue_category_weight: number;
  critical_infra_proximity: number;
  growth_velocity_factor: number;
  total_score: number;
}

export interface Incident {
  id: string;
  issue_type: string;
  latitude: number;
  longitude: number;
  geo_footprint?: number[][];
  first_reported_at: string;
  last_reported_at: string;
  report_count: number;
  unique_citizen_count: number;
  estimated_affected_population: number;
  severity_score: number;
  severity_breakdown: SeverityBreakdown;
  root_cause?: string;
  root_cause_confidence?: number;
  root_cause_evidence: string[];
  growth_velocity: number;
  escalation_risk: string;
  escalation_confidence?: number;
  ai_summary?: string;
  recommended_action?: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolved_at?: string | null;
  updated_at: string;
}

export interface IncidentDetail extends Incident {
  reports: Report[];
  infrastructure_impacts: InfrastructureImpact[];
}
