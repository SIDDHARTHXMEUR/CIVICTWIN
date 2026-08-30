import React, { useState } from 'react';
import { useStore } from '../store';
import type { Incident } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sun, Moon } from 'lucide-react';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCitizenMarkerIcon = () => {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:28px; height:28px;">
        <div style="
          position: absolute; 
          width: 28px; height: 28px; 
          border-radius: 50%; 
          background: rgba(183, 16, 42, 0.4); 
          animation: markerPulse 1.5s infinite;
        "></div>
        <div style="
          width: 14px; height: 14px; 
          border-radius: 50%; 
          background: #b7102a; 
          border: 2px solid white; 
          box-shadow: 0 0 0 1px #b7102a;
          position: relative; z-index: 2;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface CitizenAppProps {
  onNavigate: (view: 'gateway' | 'dashboard' | 'citizen') => void;
}

export default function CitizenApp({ onNavigate }: CitizenAppProps) {
  const addCitizenReport = useStore(state => state.addCitizenReport);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const isDark = theme === 'dark';

  const [category, setCategory] = useState('Water Burst & Pressure Drop');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('26.9197° N, 75.7857° E — MI Road, Jaipur');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120" fill="%23eeeee6"><rect width="160" height="120" fill="%23eeeee6" stroke="%231a1c17" stroke-width="2"/><rect x="20" y="20" width="120" height="80" fill="%23ffffff" stroke="%23807474" stroke-width="1"/><path d="M30 80 L60 50 L90 75 L120 40 L140 80 Z" fill="%23d6c2c1" stroke="%23b7102a" stroke-width="2"/><circle cx="50" cy="40" r="8" fill="%23f59e0b"/><text x="80" y="112" font-size="8" font-family="monospace" text-anchor="middle" fill="%231a1c17">EVIDENCE_PHOTO.JPG</text></svg>');

  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [createdIncident, setCreatedIncident] = useState<Incident | null>(null);

  const steps = [
    '1. Encrypting telemetry & packaging report...',
    '2. Running AI Computer Vision & Severity Matrix...',
    '3. Linking report to spatial node JP-T02 on Digital Twin...',
    '4. Dispatching incident payload to Municipal Command Center...'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('submitting');
    setStepIndex(0);

    setTimeout(() => setStepIndex(1), 700);
    setTimeout(() => setStepIndex(2), 1400);
    setTimeout(() => setStepIndex(3), 2100);

    setTimeout(() => {
      const incident = addCitizenReport({
        category,
        description,
        location,
        photoUrl: selectedPhoto || undefined,
      });
      setCreatedIncident(incident);
      setSubmitState('success');
    }, 2800);
  };

  const handleReset = () => {
    setSubmitState('idle');
    setCreatedIncident(null);
    setDescription('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: isDark ? '#0b0c0e' : '#f0ede4',
      color: isDark ? '#f3f4f6' : '#0a0a0a',
      fontFamily: '"Hanken Grotesk", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: isDark ? '#12141a' : '#0a0a0a',
        color: '#ffffff',
        padding: '12px 24px',
        borderBottom: `2px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.05em' }}>CIVICTWIN</span>
          <span style={{
            fontSize: '10px',
            fontFamily: '"JetBrains Mono", monospace',
            backgroundColor: '#00364e',
            color: '#00a5e3',
            padding: '2px 8px',
            border: '1px solid #005073',
          }}>
            CITIZEN REPORTING PORTAL
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: isDark ? '#1c202c' : '#eeeee6',
              color: isDark ? '#f3f4f6' : '#1a1c17',
              border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
              padding: '6px 12px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isDark ? <Sun size={12} color="#f59e0b" /> : <Moon size={12} color="#1a1c17" />}
            <span>{isDark ? 'LIGHT MODE' : 'DARK MODE'}</span>
          </button>
          <button
            onClick={() => onNavigate('gateway')}
            style={{
              backgroundColor: 'transparent',
              color: '#9ca3af',
              border: '1px solid #4e4444',
              padding: '6px 12px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
            }}
          >
            ← GATEWAY
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        maxWidth: '780px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}>
        {submitState !== 'success' ? (
          <div style={{
            backgroundColor: isDark ? '#161922' : '#ffffff',
            border: `2px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
            padding: '28px',
            boxShadow: isDark ? '4px 4px 0px #2a2f3d' : '4px 4px 0px #1a1c17',
          }}>
            <div style={{
              fontSize: '10px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              color: '#b7102a',
              backgroundColor: isDark ? '#2b1010' : '#ffdad6',
              display: 'inline-block',
              padding: '3px 8px',
              marginBottom: '12px',
              border: `1px solid ${isDark ? '#7f1d1d' : '#ba1a1a'}`,
            }}>
              FIELD REPORT SUBMISSION
            </div>
            
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', color: isDark ? '#f3f4f6' : '#1a1c17' }}>
              Report Infrastructure & Civic Issue
            </h1>
            <p style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#4e4444', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Your report will be automatically geo-tagged, triaged by the AI Engine, and pushed live onto the Municipal Command Center digital twin map.
            </p>

            {submitState === 'submitting' ? (
              <div style={{
                backgroundColor: isDark ? '#1c202c' : '#eeeee6',
                border: `2px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                padding: '32px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  border: `4px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                  borderTopColor: '#b7102a',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                
                <div style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#f3f4f6' : '#1a1c17' }}>
                  PROCESSING CIVIC REPORT
                </div>
                <div style={{
                  fontSize: '12px',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: '#b7102a',
                  backgroundColor: isDark ? '#161922' : '#ffffff',
                  padding: '8px 16px',
                  border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                  width: '100%',
                  boxSizing: 'border-box',
                }}>
                  {steps[stepIndex]}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
                    ISSUE CATEGORY
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                      backgroundColor: isDark ? '#1c202c' : '#fafaf1',
                      color: isDark ? '#f3f4f6' : '#1a1c17',
                      fontWeight: 600,
                    }}
                  >
                    <option>Water Burst & Pressure Drop</option>
                    <option>Traffic Signal Malfunction</option>
                    <option>Severe Road Pothole / Collapse</option>
                    <option>AQI / Environmental Hazard</option>
                    <option>Garbage Buildup / Waste</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
                    DESCRIPTION & REMARKS
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue you're reporting..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                      backgroundColor: isDark ? '#1c202c' : '#fafaf1',
                      color: isDark ? '#f3f4f6' : '#1a1c17',
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                {/* Geo Location */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                      AUTOMATIC LOCATION TAG
                    </label>
                    <span style={{ fontSize: '10px', color: '#0891b2', fontFamily: '"JetBrains Mono", monospace' }}>● GPS ACTIVE</span>
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '12px',
                      fontFamily: '"JetBrains Mono", monospace',
                      border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                      backgroundColor: isDark ? '#1c202c' : '#eeeee6',
                      color: isDark ? '#38bdf8' : '#1a1c17',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
                    ATTACH EVIDENCE PHOTO
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {selectedPhoto && (
                      <img
                        src={selectedPhoto}
                        alt="Evidence Preview"
                        style={{ width: '80px', height: '60px', objectFit: 'cover', border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}` }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120" fill="%23eeeee6"><rect width="160" height="120" fill="%23eeeee6" stroke="%231a1c17" stroke-width="2"/><rect x="20" y="20" width="120" height="80" fill="%23ffffff" stroke="%23807474" stroke-width="1"/><path d="M30 80 L60 50 L90 75 L120 40 L140 80 Z" fill="%23d6c2c1" stroke="%23b7102a" stroke-width="2"/><circle cx="50" cy="40" r="8" fill="%23f59e0b"/><text x="80" y="112" font-size="8" font-family="monospace" text-anchor="middle" fill="%231a1c17">EVIDENCE_PHOTO.JPG</text></svg>')}
                      style={{
                        padding: '10px 16px',
                        fontSize: '11px',
                        fontFamily: '"JetBrains Mono", monospace',
                        backgroundColor: isDark ? '#1c202c' : '#eeeee6',
                        color: isDark ? '#f3f4f6' : '#1a1c17',
                        border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                        cursor: 'pointer',
                      }}
                    >
                      📷 ATTACHED (EVIDENCE_PHOTO.JPG)
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#b7102a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    marginTop: '8px',
                    boxShadow: isDark ? '2px 2px 0px #7f1d1d' : '2px 2px 0px #1a1c17',
                  }}
                >
                  SUBMIT CIVIC INCIDENT REPORT →
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Success AI Status Card + Interactive Spatial Map */
          <div style={{
            backgroundColor: isDark ? '#161922' : '#ffffff',
            border: `2px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
            padding: '32px',
            boxShadow: isDark ? '6px 6px 0px #2a2f3d' : '6px 6px 0px #1a1c17',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`, paddingBottom: '16px' }}>
              <div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#0891b2',
                  display: 'inline-block',
                  padding: '3px 8px',
                  marginBottom: '6px',
                }}>
                  ✓ REPORT TRIAGED & SPATIALLY MARKED
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: isDark ? '#f3f4f6' : '#1a1c17' }}>
                  Incident Ref: {createdIncident?.id}
                </h2>
              </div>
              <div style={{
                textAlign: 'right',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#b7102a' }}>
                  {createdIncident?.severity} / 10
                </div>
                <div style={{ fontSize: '9px', color: '#9ca3af' }}>SEVERITY SCORE</div>
              </div>
            </div>

            {/* Interactive Map View */}
            <div style={{
              border: `2px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
              overflow: 'hidden',
              height: '240px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1000,
                backgroundColor: isDark ? '#0b0c0e' : '#111318',
                color: '#ffffff',
                padding: '4px 10px',
                fontSize: '10px',
                fontFamily: '"JetBrains Mono", monospace',
                border: '1px solid #b7102a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#b7102a', display: 'inline-block' }}></span>
                <span>SPATIAL BEACON: MARKED ON CITY TWIN</span>
              </div>

              <MapContainer
                key={isDark ? 'citizen-dark' : 'citizen-light'}
                center={[26.9197, 75.7857]}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                <Marker position={[26.9197, 75.7857]} icon={createCitizenMarkerIcon()}>
                  <Popup>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px' }}>
                      <strong style={{ color: '#b7102a' }}>📍 {createdIncident?.title}</strong><br />
                      Ref: {createdIncident?.id}<br />
                      Status: Live on Command Center<br />
                      Location: {location}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* AI Summary Block */}
            <div style={{
              backgroundColor: isDark ? '#1c202c' : '#eeeee6',
              border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
              padding: '16px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#b7102a', marginBottom: '6px' }}>
                🤖 AI VISION & SPATIAL ENGINE SUMMARY
              </div>
              <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5, color: isDark ? '#f3f4f6' : '#1a1c17' }}>
                Anomaly detected at location. Automated cross-referencing matched pressure drop readings at spatial node <strong>{createdIncident?.linkedNodeId} (MI Road Traffic Grid)</strong>. Confidence rating: <strong>{createdIncident?.confidencePct}%</strong>.
              </p>
            </div>

            {/* Incident Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              <div style={{ backgroundColor: isDark ? '#1c202c' : '#fafaf1', padding: '10px', border: `1px solid ${isDark ? '#2a2f3d' : '#d2c3c3'}` }}>
                <span style={{ color: '#9ca3af', display: 'block' }}>CATEGORY</span>
                <strong>{createdIncident?.category}</strong>
              </div>
              <div style={{ backgroundColor: isDark ? '#1c202c' : '#fafaf1', padding: '10px', border: `1px solid ${isDark ? '#2a2f3d' : '#d2c3c3'}` }}>
                <span style={{ color: '#9ca3af', display: 'block' }}>IMPACTED SPATIAL NODE</span>
                <strong>{createdIncident?.linkedNodeId}</strong>
              </div>
              <div style={{ backgroundColor: isDark ? '#1c202c' : '#fafaf1', padding: '10px', border: `1px solid ${isDark ? '#2a2f3d' : '#d2c3c3'}` }}>
                <span style={{ color: '#9ca3af', display: 'block' }}>ASSIGNED DISPATCH</span>
                <strong>Zone 4 Infrastructure Response Unit</strong>
              </div>
              <div style={{ backgroundColor: isDark ? '#1c202c' : '#fafaf1', padding: '10px', border: `1px solid ${isDark ? '#2a2f3d' : '#d2c3c3'}` }}>
                <span style={{ color: '#9ca3af', display: 'block' }}>STATUS</span>
                <strong style={{ color: '#b7102a' }}>LIVE ON COMMAND RAIL & MAP</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => onNavigate('gateway')}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#1c202c' : '#1a1c17',
                  color: '#ffffff',
                  border: `1px solid ${isDark ? '#3a3d45' : 'none'}`,
                  padding: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  boxShadow: isDark ? '2px 2px 0px #3a3d45' : '2px 2px 0px #807474',
                }}
              >
                RETURN GATEWAY →
              </button>
              <button
                onClick={handleReset}
                style={{
                  backgroundColor: isDark ? '#1c202c' : '#eeeee6',
                  color: isDark ? '#f3f4f6' : '#1a1c17',
                  border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
                  padding: '12px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                }}
              >
                SUBMIT ANOTHER
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
