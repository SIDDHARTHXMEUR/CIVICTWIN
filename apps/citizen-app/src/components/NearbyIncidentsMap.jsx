import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { fetchNearbyIncidents } from '../services/api';
import { AlertCircle, Users, Activity } from 'lucide-react';

const createCustomIcon = (severity) => {
  let color = '#10B981'; // Emerald Low
  if (severity > 75) color = '#F43F5E'; // Rose Critical
  else if (severity > 50) color = '#F59E0B'; // Amber High
  else if (severity > 30) color = '#06B6D4'; // Cyan Medium

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 12px ${color};
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export default function NearbyIncidentsMap() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchNearbyIncidents();
      setIncidents(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Center on NIT Delhi (28.8427, 77.1048)
  const position = [28.8427, 77.1048];

  return (
    <div style={{ padding: '0 16px 20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Nearby Open Incidents ({incidents.length})
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#06B6D4' }}>Live Public View</span>
      </div>

      <div className="glass-panel" style={{ height: '340px', overflow: 'hidden', marginBottom: '16px' }}>
        <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.latitude, inc.longitude]}
              icon={createCustomIcon(inc.severity_score)}
            >
              <Popup>
                <div style={{ padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: inc.severity_score > 70 ? '#F43F5E' : '#06B6D4'
                  }}>
                    {inc.issue_type.replace('_', ' ')} • Severity {inc.severity_score}/100
                  </span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '4px 0', color: '#0F172A' }}>
                    {inc.ai_summary || inc.issue_type}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    👥 {inc.report_count} citizen report(s) merged
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          <Circle center={position} radius={1500} pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.08 }} />
        </MapContainer>
      </div>

      {/* Incident List Below Map */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {incidents.map((inc) => (
          <div key={inc.id} className="glass-panel" style={{ padding: '14px', borderLeft: `4px solid ${inc.severity_score > 70 ? '#F43F5E' : inc.severity_score > 50 ? '#F59E0B' : '#06B6D4'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', textTransform: 'capitalize' }}>
                {inc.issue_type.replace('_', ' ')}
              </span>
              <span className="badge badge-merged">
                {inc.report_count} Reports Merged
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '8px' }}>
              {inc.ai_summary}
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94A3B8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> {inc.unique_citizen_count} Unique Citizens
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={12} color="#F59E0B" /> Risk: {inc.escalation_risk}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
