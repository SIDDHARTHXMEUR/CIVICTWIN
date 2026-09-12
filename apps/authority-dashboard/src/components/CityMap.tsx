import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Incident, InfrastructurePoint } from '../types';
import { Shield, Eye, Layers } from 'lucide-react';

interface Props {
  incidents: Incident[];
  infrastructure: InfrastructurePoint[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

const getMarkerIcon = (severity: number, isSelected: boolean) => {
  let color = '#10B981'; // Emerald Low
  if (severity > 75) color = '#F43F5E'; // Rose Critical
  else if (severity > 50) color = '#F59E0B'; // Amber High
  else if (severity > 30) color = '#06B6D4'; // Cyan Medium

  const size = isSelected ? 32 : 24;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid ${isSelected ? '#FFF' : 'rgba(255,255,255,0.7)'};
      box-shadow: 0 0 ${isSelected ? '25px' : '12px'} ${color};
      transition: all 0.3s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const getInfraIcon = (category: string) => {
  let color = '#3B82F6';
  if (category === 'hospital') color = '#EC4899';
  else if (category === 'school') color = '#8B5CF6';
  else if (category === 'transit') color = '#10B981';

  return L.divIcon({
    className: 'infra-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid #FFF;
      box-shadow: 0 0 6px ${color};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

export const CityMap: React.FC<Props> = ({
  incidents,
  infrastructure,
  selectedIncident,
  onSelectIncident
}) => {
  const [showInfra, setShowInfra] = useState(true);

  // Center on NIT Delhi campus
  const position: [number, number] = [28.8427, 77.1048];

  return (
    <div className="glass-card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Infrastructure Toggle Overlay */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        zIndex: 1000,
        background: 'rgba(13, 18, 31, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        padding: '8px 12px',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.8rem'
      }}>
        <Layers size={16} color="#06B6D4" />
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={showInfra}
            onChange={(e) => setShowInfra(e.target.checked)}
            style={{ accentColor: '#06B6D4' }}
          />
          Critical Infrastructure Layer
        </label>
      </div>

      <MapContainer center={position} zoom={13} scrollWheelZoom={true}>
        {/* OpenStreetMap standard zero-key tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Infrastructure Points */}
        {showInfra && infrastructure.map((inf) => (
          <Marker
            key={inf.id}
            position={[inf.latitude, inf.longitude]}
            icon={getInfraIcon(inf.category)}
          >
            <Popup>
              <div style={{ padding: '2px', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase' }}>
                  Infrastructure ({inf.category})
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: '2px 0', color: '#FFF' }}>{inf.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incidents Markers and Footprints */}
        {incidents.map((inc) => {
          const isSel = selectedIncident?.id === inc.id;
          return (
            <React.Fragment key={inc.id}>
              {/* Footprint polygon if available */}
              {inc.geo_footprint && inc.geo_footprint.length > 2 && (
                <Polygon
                  positions={inc.geo_footprint as [number, number][]}
                  pathOptions={{
                    color: inc.severity_score > 75 ? '#F43F5E' : '#06B6D4',
                    fillColor: inc.severity_score > 75 ? '#F43F5E' : '#06B6D4',
                    fillOpacity: isSel ? 0.35 : 0.15,
                    weight: isSel ? 3 : 1.5
                  }}
                />
              )}

              <Marker
                position={[inc.latitude, inc.longitude]}
                icon={getMarkerIcon(inc.severity_score, isSel)}
                eventHandlers={{
                  click: () => onSelectIncident(inc)
                }}
              >
                <Popup>
                  <div style={{ padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className={`severity-badge ${
                        inc.severity_score > 75 ? 'severity-critical' : inc.severity_score > 50 ? 'severity-high' : 'severity-medium'
                      }`}>
                        Score {inc.severity_score}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', margin: '4px 0' }}>
                      {inc.issue_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: '2px 0' }}>
                      {inc.ai_summary}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                      👥 {inc.report_count} linked report(s) • {inc.unique_citizen_count} citizens
                    </p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
