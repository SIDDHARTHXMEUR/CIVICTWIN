import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { CityNode } from '../store';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon path issues with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Marker Severity Encoding:
// Green = normal (small 8px, static, calm baseline)
// Orange = warning (medium 12px, static)
// Red-Orange (#ea3b1b) = anomaly/critical (large 18px, pulsing ring animation)
const createNodeIcon = (status: string) => {
  const isAnomaly = status === 'anomaly' || status === 'critical';
  const isWarning = status === 'warning';

  const dotColor = isAnomaly ? '#ea3b1b' : isWarning ? '#f59e0b' : '#10b981';
  const dotSize = isAnomaly ? 18 : isWarning ? 12 : 8;
  const containerSize = isAnomaly ? 32 : isWarning ? 20 : 14;

  const pulseHtml = isAnomaly ? `
    <div style="
      position: absolute; 
      width: 32px; height: 32px; 
      border-radius: 0px; 
      background: rgba(234, 59, 27, 0.35); 
      top: 50%; left: 50%; 
      transform: translate(-50%, -50%);
      animation: markerPulse 1.5s infinite;
    "></div>` : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:${containerSize}px; height:${containerSize}px;">
        ${pulseHtml}
        <div style="
          width:${dotSize}px; height:${dotSize}px; 
          border-radius:0px; 
          background:${dotColor}; 
          border:${isAnomaly ? '2px solid #ffffff' : '1.5px solid #ffffff'}; 
          box-shadow: 0 0 0 1px ${dotColor}, 0 2px 4px rgba(0,0,0,0.25);
          position:relative; z-index:2;
        "></div>
      </div>
    `,
    iconSize: [containerSize, containerSize],
    iconAnchor: [containerSize / 2, containerSize / 2],
  });
};

export default function GridTopologyPanel() {
  const nodes = useStore(state => state.nodes);
  const incidents = useStore(state => state.incidents);
  const triggerAnomaly = useStore(state => state.triggerAnomaly);
  const pingNode = useStore(state => state.pingNode);
  const recalibrateNode = useStore(state => state.recalibrateNode);
  const activeDomain = useStore(state => state.activeDomain);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  // Interactive Map Layer State: 'vector' | 'satellite' | 'topo'
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'topo'>('satellite');
  const [showAssetDirectory, setShowAssetDirectory] = useState(false);
  const [directoryDomainFilter, setDirectoryDomainFilter] = useState('all');

  const displayedNodes = activeDomain === 'all' || activeDomain === 'intelligence'
    ? nodes
    : nodes.filter(n => n.domain === activeDomain);

  const anomalies = displayedNodes.filter(n => n.status === 'anomaly');
  const hasAnomaly = anomalies.length > 0;
  const mapCenter: [number, number] = [26.9124, 75.7873];

  // Dynamic Tile URL selector
  let tileLayerUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  if (mapLayer === 'satellite') {
    tileLayerUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  } else if (mapLayer === 'topo') {
    tileLayerUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  }

  return (
    <div className="beveled-3d-frame" style={{
      flex: '1 1 0',
      backgroundColor: isDark ? '#161922' : '#f5f2e8',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      overflow: 'hidden',
      borderRadius: '0px',
    }}>
      {/* Header — 20px Space Grotesk title with numeric index 01 / */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
        backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '13px',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            color: isDark ? '#6b7280' : '#6b7280',
          }}>
            01 /
          </span>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            fontFamily: '"Space Grotesk", sans-serif',
            color: isDark ? '#f3f4f6' : '#0a0a0a',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            JAIPUR GRID TOPOLOGY
          </span>
          {activeDomain !== 'all' && (
            <span style={{
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              color: '#0a0a0a',
              backgroundColor: '#4fc9dc',
              padding: '2px 6px',
              border: `1px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}`,
              borderRadius: '0px',
              textTransform: 'uppercase',
              marginLeft: '4px',
              fontWeight: 800,
            }}>
              [{activeDomain}]
            </span>
          )}
        </div>

        {/* Map Layer Switcher & Live Badge & Telemetry Directory Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Telemetry Asset Directory Toggle */}
          <button
            onClick={() => setShowAssetDirectory(true)}
            style={{
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 800,
              padding: '3px 8px',
              backgroundColor: isDark ? '#1c202c' : '#4fc9dc',
              color: isDark ? '#4fc9dc' : '#0a0a0a',
              border: `1px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}`,
              borderRadius: '0px',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            📡 TELEMETRY DIRECTORY ({nodes.length})
          </button>

          {/* Layer Selector Buttons */}
          <div style={{ display: 'flex', border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`, borderRadius: '0px' }}>
            {[
              { id: 'satellite', label: 'SATELLITE' },
              { id: 'vector', label: 'VECTOR' },
              { id: 'topo', label: 'TOPO' },
            ].map(layer => (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id as 'vector' | 'satellite' | 'topo')}
                style={{
                  fontSize: '8px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 800,
                  padding: '2px 6px',
                  border: 'none',
                  borderRadius: '0px',
                  backgroundColor: mapLayer === layer.id
                    ? '#4fc9dc'
                    : isDark ? '#161922' : '#f5f2e8',
                  color: mapLayer === layer.id ? '#0a0a0a' : isDark ? '#9ca3af' : '#3a3a3a',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>

          <span style={{
            fontSize: '9px', fontWeight: 800, color: '#fff',
            backgroundColor: hasAnomaly ? '#ea3b1b' : isDark ? '#2a2f3d' : '#0a0a0a',
            padding: '3px 8px',
            borderRadius: '0px',
            letterSpacing: '0.08em',
            fontFamily: '"JetBrains Mono", monospace',
            animation: hasAnomaly ? 'rhythmicPulse 2s ease-in-out infinite' : 'none',
          }}>LIVE</span>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer
          key={`${isDark ? 'dark' : 'light'}-${mapLayer}`}
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url={tileLayerUrl} />

          {/* Spatial Anomaly Propagation Vector Line */}
          {hasAnomaly && (
            <Polyline
              positions={[[26.9124, 75.7873], [26.9197, 75.7857], [26.9250, 75.8191]]}
              pathOptions={{
                color: '#ef4444',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 12',
              }}
            />
          )}

          {displayedNodes.map(node => {
            const isAnomalyNode = node.status === 'anomaly';
            // Sync callout title to exact incident title from store
            const linkedIncident = incidents.find(i => i.linkedNodeId === node.id && i.status === 'open') || incidents.find(i => i.status === 'open');
            const calloutTitle = linkedIncident ? linkedIncident.title : `${node.name} Anomaly`;

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={createNodeIcon(node.status)}
                eventHandlers={{
                  click: () => {
                    if (node.status !== 'anomaly') {
                      triggerAnomaly(node.id, {
                        title: `${node.name} Anomaly`,
                        description: `Telemetry drop detected on ${node.domain} node ${node.id}.`,
                        severity: 8.4,
                        impactPct: 76,
                        confidencePct: 91,
                        category: node.domain,
                      });
                    }
                  }
                }}
              >
                {isAnomalyNode && (
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -16]}
                  >
                    <div style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      fontFamily: '"JetBrains Mono", monospace',
                      letterSpacing: '0.05em',
                      border: '1px solid #ffffff',
                      borderRadius: '0px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      whiteSpace: 'nowrap',
                    }}>
                      ⚠ {calloutTitle.toUpperCase()}
                    </div>
                  </Tooltip>
                )}

                <Popup>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px' }}>
                    <strong>{node.name}</strong><br />
                    ID: {node.id}<br />
                    Status: <span style={{ color: node.status === 'anomaly' ? '#ea3b1b' : node.status === 'warning' ? '#f59e0b' : '#10b981', fontWeight: 700 }}>{node.status.toUpperCase()}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapFlyEffect hasAnomaly={hasAnomaly} anomalies={anomalies} defaultCenter={mapCenter} />
        </MapContainer>
      </div>

      {/* Telemetry Asset Directory & Sensor Inspector Modal */}
      {showAssetDirectory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.75)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px',
        }}>
          <div className="beveled-3d-frame" style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8', width: '100%', maxWidth: '640px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: '#4fc9dc' }}>
                  JAIPUR SPATIAL TWIN TELEMETRY REGISTRY
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: isDark ? '#ffffff' : '#0a0a0a' }}>
                  Telemetry Assets & Sensors ({nodes.length})
                </h3>
              </div>
              <button onClick={() => setShowAssetDirectory(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: isDark ? '#9ca3af' : '#0a0a0a' }}>✕</button>
            </div>

            {/* Domain Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {['all', 'infrastructure', 'mobility', 'environment'].map(dom => (
                <button
                  key={dom}
                  onClick={() => setDirectoryDomainFilter(dom)}
                  style={{
                    padding: '4px 10px', fontSize: '9px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 800,
                    textTransform: 'uppercase', borderRadius: '0px', cursor: 'pointer',
                    backgroundColor: directoryDomainFilter === dom ? '#4fc9dc' : isDark ? '#1c202c' : '#e8e4d8',
                    color: directoryDomainFilter === dom ? '#0a0a0a' : isDark ? '#9ca3af' : '#3a3a3a',
                    border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
                  }}
                >
                  {dom} ({dom === 'all' ? nodes.length : nodes.filter(n => n.domain === dom).length})
                </button>
              ))}
            </div>

            {/* Asset Cards Grid */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nodes
                .filter(n => directoryDomainFilter === 'all' || n.domain === directoryDomainFilter)
                .map(node => (
                  <div key={node.id} style={{
                    backgroundColor: isDark ? '#1c202c' : '#ffffff',
                    border: `1px solid ${node.status === 'anomaly' ? '#ea3b1b' : node.status === 'warning' ? '#f59e0b' : isDark ? '#2a2f3d' : '#d5d0c3'}`,
                    padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#ffffff' : '#0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}>
                          {node.name} <span style={{ fontSize: '10px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>({node.id})</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>
                          {node.assetType} // {node.locationName}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace',
                        padding: '2px 6px', color: '#ffffff',
                        backgroundColor: node.status === 'anomaly' ? '#ea3b1b' : node.status === 'warning' ? '#f59e0b' : '#10b981',
                      }}>
                        {node.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: isDark ? '#12141a' : '#f5f2e8', padding: '6px 8px',
                      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', display: 'flex', justifyContent: 'space-between',
                      border: `1px solid ${isDark ? '#2a2f3d' : '#e8e4d8'}`,
                    }}>
                      <span>READING: <strong>{node.telemetryValue || 'Normal'}</strong></span>
                      <span>PING: <strong>{node.pingMs || 14}ms</strong></span>
                      <span>LOSS: <strong>{node.packetLoss || 0.4}%</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <button
                        onClick={() => pingNode(node.id)}
                        style={{
                          flex: 1, padding: '4px 8px', fontSize: '9px', fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace', backgroundColor: isDark ? '#2a2f3d' : '#e8e4d8',
                          color: isDark ? '#ffffff' : '#0a0a0a', border: `1px solid ${isDark ? '#3a3d45' : '#0a0a0a'}`, cursor: 'pointer',
                        }}
                      >
                        ⚡ PING SENSOR
                      </button>
                      <button
                        onClick={() => recalibrateNode(node.id)}
                        style={{
                          flex: 1, padding: '4px 8px', fontSize: '9px', fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace', backgroundColor: isDark ? '#2a2f3d' : '#e8e4d8',
                          color: isDark ? '#ffffff' : '#0a0a0a', border: `1px solid ${isDark ? '#3a3d45' : '#0a0a0a'}`, cursor: 'pointer',
                        }}
                      >
                        🛠 RECALIBRATE
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapFlyEffect({ hasAnomaly, anomalies, defaultCenter }: {
  hasAnomaly: boolean;
  anomalies: CityNode[];
  defaultCenter: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (hasAnomaly && anomalies.length > 0) {
      map.flyTo([anomalies[0].lat, anomalies[0].lng], 15, { duration: 1.2 });
    } else {
      map.flyTo(defaultCenter, 13, { duration: 1.2 });
    }
  }, [hasAnomaly, anomalies.length]);
  return null;
}
