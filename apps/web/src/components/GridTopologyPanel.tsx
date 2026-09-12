import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { CityNode } from '../store';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { JAIPUR_CENTER, JAIPUR_ZOOM } from '../config/mapConfig';

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

// Wards removed in favor of precise radius mapping

const createNodeIcon = (status: string, hasCriticalIncident: boolean, hasWarningIncident: boolean) => {
  const isAnomaly = hasCriticalIncident;
  const isWarning = hasWarningIncident || status === 'warning';

  const dotColor = isAnomaly ? '#ea3b1b' : isWarning ? '#b45309' : '#64748b';
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

function MapUpdater({ targetCoords }: { targetCoords: [number, number] | null }) {
  const map = useMap();
  const focusedIncidentId = useStore(state => state.focusedIncidentId);
  const incidents = useStore(state => state.incidents);
  
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 16, { duration: 1.2 });
    } else if (focusedIncidentId) {
      const incident = incidents.find(i => i.id === focusedIncidentId);
      if (incident && incident.lat && incident.lng) {
        map.flyTo([incident.lat, incident.lng], 15, { duration: 1.5 });
      }
    }
  }, [focusedIncidentId, incidents, targetCoords, map]);
  
  return null;
}

function MapResizeWatcher({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 150);
    const t3 = setTimeout(() => map.invalidateSize(), 350);
    const t4 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen, map]);

  return null;
}

export default function GridTopologyPanel() {
  const nodes = useStore(state => state.nodes);
  const incidents = useStore(state => state.incidents);
  const triggerAnomaly = useStore(state => state.triggerAnomaly);
  const pingNode = useStore(state => state.pingNode);
  const recalibrateNode = useStore(state => state.recalibrateNode);
  const pingingNodes = useStore(state => state.pingingNodes);
  const calibratingNodes = useStore(state => state.calibratingNodes);
  const activeDomain = useStore(state => state.activeDomain);
  const optimalRoute = useStore(state => state.optimalRoute);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  // Interactive Map Layer State: 'vector' | 'satellite' | 'topo'
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'topo'>('vector');
  const [showAssetDirectory, setShowAssetDirectory] = useState(false);
  const [directoryDomainFilter, setDirectoryDomainFilter] = useState('all');
  const [legendOpen, setLegendOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [targetSensorCoords, setTargetSensorCoords] = useState<[number, number] | null>(null);

  const displayedNodes = activeDomain === 'all' || activeDomain === 'intelligence'
    ? nodes
    : nodes.filter(n => n.domain === activeDomain);

  const anomalies = displayedNodes.filter(n => n.status === 'anomaly');
  const warnings = displayedNodes.filter(n => n.status === 'warning');
  const normalNodes = displayedNodes.filter(n => n.status === 'normal' || n.status === 'online' || !n.status);
  const hasAnomaly = anomalies.length > 0;
  const mapCenter: [number, number] = JAIPUR_CENTER;

  // Dynamic Tile URL selector
  let tileLayerUrl = isDark
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  if (mapLayer === 'satellite') {
    tileLayerUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  } else if (mapLayer === 'topo') {
    tileLayerUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  }

  return (
    <div className="beveled-3d-frame" style={isFullscreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      backgroundColor: isDark ? '#161922' : '#f5f2e8',
      display: 'flex',
      flexDirection: 'column',
    } : {
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

          {activeDomain !== 'all' && activeDomain !== 'intelligence' && (
            <button
              onClick={() => useStore.getState().setActiveDomain('all')}
              title="Click to reset domain filter"
              style={{
                fontSize: '9px',
                fontFamily: '"JetBrains Mono", monospace',
                color: isDark ? '#4fc9dc' : '#0a0a0a',
                backgroundColor: isDark ? 'rgba(79, 201, 220, 0.15)' : '#e0dbcb',
                padding: '2px 8px',
                border: `1px solid ${isDark ? '#4fc9dc' : '#c4beaf'}`,
                borderRadius: '0px',
                textTransform: 'uppercase',
                marginLeft: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{activeDomain}</span>
              <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          )}
        </div>

        {/* Map Layer Switcher & Fullscreen & Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Layer Selector Buttons */}
          <div style={{ display: 'flex', border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`, borderRadius: '0px' }}>
            {[
              { id: 'vector', label: 'VECTOR' },
              { id: 'satellite', label: 'SATELLITE' },
              { id: 'topo', label: 'TOPO' },
            ].map(layer => (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id as 'vector' | 'satellite' | 'topo')}
                style={{
                  fontSize: '8px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 800,
                  padding: '3px 7px',
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

          {/* Fullscreen Map Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen GIS Map"
            style={{
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 800,
              padding: '3px 8px',
              backgroundColor: isFullscreen ? '#4fc9dc' : (isDark ? '#1c202c' : '#ffffff'),
              color: isFullscreen ? '#0a0a0a' : (isDark ? '#f3f4f6' : '#1a1c17'),
              border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
              borderRadius: '0px',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            {isFullscreen ? '⤢ EXIT' : '⤢ FULLSCREEN'}
          </button>

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
      <div style={{ flex: 1, position: 'relative', minHeight: 0, width: '100%', height: '100%' }}>
        <MapContainer
          key={`${isDark ? 'dark' : 'light'}-${mapLayer}-${isFullscreen ? 'fullscreen' : 'inline'}`}
          center={mapCenter}
          zoom={JAIPUR_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url={tileLayerUrl} />
          <MapUpdater targetCoords={targetSensorCoords} />
          <MapResizeWatcher isFullscreen={isFullscreen} />

          {/* Ward Risk Heatmap Polygons Removed */}

          {/* AI Optimal Dispatch VRPTW Crew Route Polyline */}
          {optimalRoute && optimalRoute.optimal_route_waypoints && (
            <Polyline
              positions={optimalRoute.optimal_route_waypoints.map((wp: any) => [wp.lat, wp.lng])}
              pathOptions={{
                color: '#10b981',
                weight: 4,
                opacity: 0.9,
                dashArray: '6, 6',
              }}
            />
          )}

          {/* Spatial Anomaly Propagation Vector Lines */}
          {hasAnomaly && (
            <>
              {/* Water break → MI Road → Hawa Mahal corridor */}
              <Polyline
                positions={[[26.9124, 75.7873], [26.9197, 75.7857], [26.9239, 75.8267]]}
                pathOptions={{
                  color: '#ef4444',
                  weight: 3,
                  opacity: 0.75,
                  dashArray: '8, 12',
                }}
              />
              {/* Nahargarh AQI → Walled City drift path */}
              <Polyline
                positions={[[26.9387, 75.8155], [26.9260, 75.8240], [26.9239, 75.8267]]}
                pathOptions={{
                  color: '#f59e0b',
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '4, 8',
                }}
              />
            </>
          )}

          {displayedNodes.map(node => {
            const activeIncidents = incidents.filter(i => i.linkedNodeId === node.id && ['reported', 'classified', 'in_progress', 'open'].includes(i.status));
            const hasCriticalIncident = activeIncidents.some(i => i.tab === 'critical');
            const hasWarningIncident = activeIncidents.some(i => i.tab === 'warnings');
            const isAnomalyNode = hasCriticalIncident || node.status === 'anomaly';
            
            // Sync callout title to exact incident title from store
            const linkedIncident = activeIncidents[0];
            const calloutTitle = linkedIncident ? linkedIncident.title : `${node.name} Anomaly`;

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={createNodeIcon(node.status, hasCriticalIncident, hasWarningIncident)}
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
                {(isAnomalyNode && linkedIncident) && (
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

          {/* Incident Heatmap Circles */}
          {incidents.filter(i => i.status === 'open' && i.lat && i.lng).map(inc => (
            <Circle
              key={`heat-${inc.id}`}
              center={[inc.lat!, inc.lng!]}
              radius={inc.id.startsWith('AI-') ? 1200 : 800} // Radius in meters
              pathOptions={{
                color: inc.id.startsWith('AI-') ? '#3b82f6' : '#ef4444',
                fillColor: inc.id.startsWith('AI-') ? '#3b82f6' : '#ef4444',
                fillOpacity: 0.15,
                weight: 1.5,
                opacity: 0.6,
              }}
            />
          ))}

          <MapFlyEffect hasAnomaly={hasAnomaly} anomalies={anomalies} defaultCenter={mapCenter} />
        </MapContainer>
        
        {/* Collapsible Map Legend Toggle */}
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '10px',
          zIndex: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
        }}>
          {/* Expanded Legend Panel */}
          <div style={{
            backgroundColor: isDark ? 'rgba(22,25,34,0.93)' : 'rgba(255,255,255,0.93)',
            border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
            padding: '10px 12px',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            minWidth: '160px',
            transformOrigin: 'bottom right',
            transform: legendOpen ? 'scaleY(1)' : 'scaleY(0)',
            opacity: legendOpen ? 1 : 0,
            maxHeight: legendOpen ? '200px' : '0px',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, opacity 0.2s ease, max-height 0.2s ease',
          }}>
            <div style={{ fontSize: '8px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', marginBottom: '7px', color: isDark ? '#9ca3af' : '#6b7280', letterSpacing: '0.06em' }}>
              MAP LEGEND
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: isDark ? '#f3f4f6' : '#0a0a0a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#ea3b1b', border: '1px solid #ffffff', flexShrink: 0 }}></div>
                <span>Critical Anomaly</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', border: '1px solid #ffffff', flexShrink: 0 }}></div>
                <span>Warning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', border: '1px solid #ffffff', flexShrink: 0 }}></div>
                <span>Normal Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.3)', border: '1px solid #ef4444', flexShrink: 0 }}></div>
                <span>Impact Radius</span>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setLegendOpen(o => !o)}
            title="Toggle Map Legend"
            style={{
              width: '28px', height: '28px',
              borderRadius: '0px',
              backgroundColor: legendOpen ? '#4fc9dc' : isDark ? 'rgba(22,25,34,0.9)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
              color: legendOpen ? '#0a0a0a' : isDark ? '#9ca3af' : '#3a3a3a',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              transition: 'background-color 0.15s ease',
            }}
          >
            ⓘ
          </button>
        </div>
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
                        onClick={() => {
                          setTargetSensorCoords([node.lat, node.lng]);
                          setShowAssetDirectory(false);
                        }}
                        style={{
                          flex: 1, padding: '4px 8px', fontSize: '9px', fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace',
                          backgroundColor: isDark ? '#1c202c' : '#ffffff',
                          color: '#4fc9dc',
                          border: `1px solid ${isDark ? '#4fc9dc' : '#005073'}`, cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        📍 LOCATE
                      </button>
                      <button
                        onClick={() => pingNode(node.id)}
                        disabled={pingingNodes.has(node.id)}
                        style={{
                          flex: 1, padding: '4px 8px', fontSize: '9px', fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace',
                          backgroundColor: pingingNodes.has(node.id) ? '#4fc9dc' : isDark ? '#2a2f3d' : '#e8e4d8',
                          color: pingingNodes.has(node.id) ? '#0a0a0a' : isDark ? '#ffffff' : '#0a0a0a',
                          border: `1px solid ${isDark ? '#3a3d45' : '#0a0a0a'}`, cursor: pingingNodes.has(node.id) ? 'wait' : 'pointer',
                          opacity: pingingNodes.has(node.id) ? 0.85 : 1,
                          transition: 'all 0.15s',
                        }}
                      >
                        {pingingNodes.has(node.id) ? '⟳ PINGING...' : '⚡ PING'}
                      </button>
                      <button
                        onClick={() => recalibrateNode(node.id)}
                        disabled={calibratingNodes.has(node.id)}
                        style={{
                          flex: 1, padding: '4px 8px', fontSize: '9px', fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace',
                          backgroundColor: calibratingNodes.has(node.id) ? '#f59e0b' : isDark ? '#2a2f3d' : '#e8e4d8',
                          color: calibratingNodes.has(node.id) ? '#0a0a0a' : isDark ? '#ffffff' : '#0a0a0a',
                          border: `1px solid ${isDark ? '#3a3d45' : '#0a0a0a'}`, cursor: calibratingNodes.has(node.id) ? 'wait' : 'pointer',
                          opacity: calibratingNodes.has(node.id) ? 0.85 : 1,
                          transition: 'all 0.15s',
                        }}
                      >
                        {calibratingNodes.has(node.id) ? '⟳ CALIBRATING...' : '🛠 CALIBRATE'}
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
