const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

let authToken: string | null = localStorage.getItem('civictwin_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('civictwin_token', token);
  } else {
    localStorage.removeItem('civictwin_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Incidents
  async getIncidents(status?: string, since?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (since) params.append('since', since);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/incidents${query}`);
  },

  async createIncident(report: { category: string; title: string; description?: string; lat: number; lng: number; location?: string; severity?: number }) {
    return request<{ incident: any; merged: boolean }>('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async executeAction(incidentId: string, actionType: string) {
    return request<any>(`/api/incidents/${incidentId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ actionType }),
    });
  },

  // Sensors
  async getSensors() {
    return request<any[]>('/api/sensors');
  },

  // Crews
  async getCrews() {
    return request<any[]>('/api/crews');
  },

  // Auth
  async login(username: string, password?: string) {
    const data = await request<{ token: string; username: string; role: string; fullName: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Analytics
  async getSummary() {
    return request<any>('/api/analytics/summary');
  },

  async getHotspots() {
    return request<any>('/api/analytics/hotspots');
  },

  // Audit
  async getAuditEvents() {
    return request<any[]>('/api/audit');
  }
};
