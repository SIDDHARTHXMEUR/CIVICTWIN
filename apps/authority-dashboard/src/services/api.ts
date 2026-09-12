import type { Incident, IncidentDetail, InfrastructurePoint, Simulation } from '../types';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8000`;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || getApiBaseUrl();

export async function fetchIncidents(params?: {
  category?: string;
  min_severity?: number;
  escalation_risk?: string;
  status?: string;
  include_resolved?: boolean;
}): Promise<Incident[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.min_severity !== undefined) query.append('min_severity', params.min_severity.toString());
  if (params?.escalation_risk) query.append('escalation_risk', params.escalation_risk);
  if (params?.status) query.append('status', params.status);
  if (params?.include_resolved === false) query.append('include_resolved', 'false');

  const res = await fetch(`${API_BASE_URL}/incidents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentDetail(incidentId: string): Promise<IncidentDetail> {
  const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`);
  if (!res.ok) throw new Error('Failed to fetch incident details');
  return res.json();
}

export async function runSimulation(incidentId: string, hours: number = 6): Promise<Simulation> {
  const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/simulate?hours=${hours}`);
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function updateIncidentStatus(incidentId: string, status: 'open' | 'in_progress' | 'resolved'): Promise<Incident> {
  const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchInfrastructurePoints(): Promise<InfrastructurePoint[]> {
  const res = await fetch(`${API_BASE_URL}/infrastructure`);
  if (!res.ok) throw new Error('Failed to fetch infrastructure points');
  return res.json();
}

export async function submitCitizenReport(payload: { raw_text: string; latitude: number; longitude: number }): Promise<any> {
  let deviceHash = localStorage.getItem('civictwin_device_hash');
  if (!deviceHash) {
    deviceHash = `web_${crypto.randomUUID()}`;
    localStorage.setItem('civictwin_device_hash', deviceHash);
  }
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_hash: deviceHash, ...payload, photo_urls: [] })
  });
  if (!res.ok) throw new Error('Could not submit the report. Is the API running on port 8000?');
  return res.json();
}

export interface LocationResult { name: string; latitude: number; longitude: number; }
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const res = await fetch(`${API_BASE_URL}/geocode/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Location search is currently unavailable. You can still place the pin on the map.');
  return res.json();
}
