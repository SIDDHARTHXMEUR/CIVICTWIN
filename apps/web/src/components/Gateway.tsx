import React, { useState } from 'react';
import { useStore } from '../store';
import { Sun, Moon, Search, Bell, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createGatewayNodeIcon = (status: string) => {
  const isAnomaly = status === 'anomaly' || status === 'critical';
  const isWarning = status === 'warning';
  const dotColor = isAnomaly ? '#ea3b1b' : isWarning ? '#f59e0b' : '#10b981';
  const dotSize = isAnomaly ? 12 : 8;

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex; align-items:center; justify-content:center; width:16px; height:16px;">
        <div style="
          width:${dotSize}px; height:${dotSize}px; 
          border-radius:0px; 
          background:${dotColor}; 
          border:1px solid #ffffff; 
          box-shadow:0 1px 3px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

interface GatewayProps {
  onSelectRole: (role: 'citizen' | 'dashboard') => void;
}

export default function Gateway({ onSelectRole }: GatewayProps) {
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const nodes = useStore(state => state.nodes);
  const incidents = useStore(state => state.incidents);
  const kpis = useStore(state => state.kpis);
  const setIsAuthenticated = useStore(state => state.setIsAuthenticated);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('Issues');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [officerId, setOfficerId] = useState('OFFICER-7741');
  const [stationCode, setStationCode] = useState('JP-ZONE-04');
  const [password, setPassword] = useState('');

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    onSelectRole('dashboard');
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Issues') {
      onSelectRole('citizen');
    } else if (tab === 'About') {
      setShowAboutModal(true);
    }
  };

  const filteredNodes = searchQuery.trim()
    ? nodes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : nodes;

  const filteredIncidents = searchQuery.trim()
    ? incidents.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : incidents;

  const tileLayerUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const openIncidentsCount = incidents.filter(i => i.status === 'open').length;
  const healthVal = Math.round(kpis.find(k => k.id === 'city-health')?.value || 72);

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      backgroundColor: isDark ? '#0b0c0e' : '#f0ede4',
      color: isDark ? '#f3f4f6' : '#0a0a0a',
      fontFamily: '"Space Grotesk", "Hanken Grotesk", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `radial-gradient(${isDark ? '#2a2f3d' : '#d8d4c7'} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
      boxSizing: 'border-box',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      {/* 1. TOP NAV (Fixed 44px Height, Full Bleed) */}
      <header className="beveled-3d-frame" style={{
        backgroundColor: isDark ? '#12141a' : '#f5f2e8',
        color: isDark ? '#f3f4f6' : '#0a0a0a',
        padding: '0 clamp(24px, 5vw, 64px)',
        height: '44px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Left: Brand + Tab Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#ffffff' : '#0a0a0a' }}>CIVICTWIN</span>
            <span style={{
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              backgroundColor: isDark ? '#00364e' : '#4fc9dc',
              color: '#0a0a0a',
              padding: '2px 6px',
              border: `1px solid ${isDark ? '#0369a1' : '#0a0a0a'}`,
              borderRadius: '0px',
              fontWeight: 800,
            }}>
              v2.4 MUNICIPAL OPERATIONAL LAYER
            </span>
          </div>

          {/* Tab-style Nav with Cyan Accent Active Underline */}
          <nav style={{ display: 'flex', gap: '2px', height: '44px', alignItems: 'center' }}>
            {['Issues', 'About'].map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  style={{
                    height: '44px',
                    padding: '0 12px',
                    fontSize: '11px',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? (isDark ? '#ffffff' : '#0a0a0a') : '#6b7280',
                    borderBottom: isActive ? '3px solid #4fc9dc' : '3px solid transparent',
                    backgroundColor: 'transparent',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderTop: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Icon Cluster + Dark Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowSearchModal(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            title="Search Nodes & Incidents"
          >
            <Search size={14} color={isDark ? '#9ca3af' : '#0a0a0a'} />
          </button>
          <button
            onClick={() => setShowNotifDrawer(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', position: 'relative' }}
            title="System Notifications"
          >
            <Bell size={14} color={isDark ? '#9ca3af' : '#0a0a0a'} />
            {openIncidentsCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '6px', height: '6px', backgroundColor: '#ea3b1b',
              }}></span>
            )}
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            title="Officer Authentication"
          >
            <User size={14} color={isDark ? '#9ca3af' : '#0a0a0a'} />
          </button>

          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
              borderRadius: '0px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isDark ? <Sun size={11} color="#f59e0b" /> : <Moon size={11} color="#0a0a0a" />}
            <span>{isDark ? 'LIGHT' : 'DARK'}</span>
          </button>
        </div>
      </header>

      {/* Main Flex Container (Full Bleed Layout, Fills 100vh Viewport) */}
      <main style={{
        flex: 1,
        width: '100%',
        padding: '16px clamp(24px, 5vw, 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '12px',
        minHeight: 0,
        boxSizing: 'border-box',
      }}>
        {/* COMPACT HERO SECTION */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '16px',
          height: '195px',
          flexShrink: 0,
          width: '100%',
        }}>
          {/* Hero Left: Breadcrumb + Eyebrow + 3-Line Headline + Subtext + Radial Graphic */}
          <div className="beveled-3d-frame" style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Concentric Arcs Radial Geometric Graphic Accent */}
            <svg
              width="230"
              height="230"
              viewBox="0 0 220 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                right: '-30px',
                bottom: '-45px',
                opacity: isDark ? 0.25 : 0.22,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <circle cx="110" cy="110" r="100" stroke={isDark ? '#ffffff' : '#0A0A0A'} strokeWidth="3" strokeDasharray="10 6" />
              <circle cx="110" cy="110" r="78" stroke="#EA3B1B" strokeWidth="5" />
              <circle cx="110" cy="110" r="54" stroke="#4FC9DC" strokeWidth="6" strokeDasharray="16 8" />
              <circle cx="110" cy="110" r="32" stroke={isDark ? '#ffffff' : '#0A0A0A'} strokeWidth="4" />
              <circle cx="110" cy="110" r="14" fill="#EA3B1B" />
            </svg>

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Breadcrumb Label */}
              <div style={{
                fontSize: '9px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: '3px',
                textTransform: 'uppercase',
              }}>
                CIVICTWIN / URBAN INTELLIGENCE PLATFORM
              </div>

              {/* Eyebrow Tag */}
              <div style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: isDark ? '#4fc9dc' : '#0a0a0a',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#4fc9dc' }}></span>
                MUNICIPAL ACCESS & INCIDENT GATEWAY
              </div>

              {/* 3-Line Stacked Headline */}
              <h1 style={{
                fontSize: '30px',
                fontWeight: 800,
                margin: '0 0 6px 0',
                color: isDark ? '#ffffff' : '#0a0a0a',
                letterSpacing: '-0.03em',
                lineHeight: 1.04,
                fontFamily: '"Space Grotesk", sans-serif',
                textTransform: 'uppercase',
              }}>
                SEE THE CITY.<br />
                PREDICT THE RISK.<br />
                <span style={{ color: '#ea3b1b' }}>RESOLVE IT LIVE.</span>
              </h1>

              {/* Subtext */}
              <p style={{
                fontSize: '12px',
                color: isDark ? '#9ca3af' : '#3a3a3a',
                margin: 0,
                lineHeight: 1.3,
                fontWeight: 600,
              }}>
                Real-time urban telemetry, spatial risk prediction, and instant incident response.
              </p>
            </div>
          </div>

          {/* Hero Right: Compact Live Map Graphic Preview */}
          <div className="beveled-3d-frame" style={{
            height: '195px',
            backgroundColor: isDark ? '#161922' : '#f5f2e8',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Active Nodes Overlay Badge */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              backgroundColor: '#ea3b1b',
              color: '#ffffff',
              padding: '3px 8px',
              fontSize: '9px',
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.06em',
              borderRadius: '0px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <span style={{ width: '5px', height: '5px', backgroundColor: '#ffffff', display: 'inline-block' }}></span>
              <span>ACTIVE NODES: {nodes.length}</span>
            </div>

            {/* Map Location Badge */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              zIndex: 1000,
              backgroundColor: isDark ? '#0b0c0e' : '#0a0a0a',
              color: '#ffffff',
              padding: '3px 8px',
              fontSize: '9px',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              border: '1px solid #4fc9dc',
            }}>
              JAIPUR SPATIAL DIGITAL TWIN // PREVIEW
            </div>

            {/* Non-interactive Leaflet Map Preview */}
            <MapContainer
              key={isDark ? 'gateway-map-dark' : 'gateway-map-light'}
              center={[26.9124, 75.7873]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              touchZoom={false}
              attributionControl={false}
            >
              <TileLayer url={tileLayerUrl} />
              {nodes.map(node => (
                <Marker key={node.id} position={[node.lat, node.lng]} icon={createGatewayNodeIcon(node.status)}>
                  <Popup>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px' }}>
                      <strong>{node.name}</strong> ({node.id})
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* ROLE CARDS GRID (NATURAL CONTENT HEIGHT, FULL BLEED) */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'start',
          width: '100%',
        }}>
          {/* Card 1: Citizen App */}
          <div style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8',
            border: `2px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? '3px 3px 0px #2a2f3d' : '3px 3px 0px #0a0a0a',
            height: 'auto',
            boxSizing: 'border-box',
          }}>
            <div style={{
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 800,
              color: '#0a0a0a',
              backgroundColor: '#4fc9dc',
              display: 'inline-block',
              padding: '3px 7px',
              marginBottom: '6px',
              alignSelf: 'flex-start',
              border: '1px solid #0a0a0a',
            }}>
              ROLE 01 // PUBLIC ACCESS
            </div>
            <h2 style={{ margin: '0 0 4px 0', lineHeight: 1.2 }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}>Citizen</span>{' '}
              <span style={{ fontSize: '17px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Incident Reporting</span>
            </h2>
            <p style={{
              fontSize: '11px',
              color: isDark ? '#9ca3af' : '#3a3a3a',
              lineHeight: 1.35,
              margin: '0 0 8px 0',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}>
              Report potholes, water logging, garbage buildup, or streetlight outages directly to city services with automated AI analysis.
            </p>
            
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 10px 0',
              fontSize: '10px',
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#0a0a0a', fontWeight: 800 }}>✓</span> Instant GPS Auto-Location Tagging
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#0a0a0a', fontWeight: 800 }}>✓</span> Automated AI Severity Classification
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#0a0a0a', fontWeight: 800 }}>✓</span> Direct Sync with Municipal Command Center
              </li>
            </ul>

            {/* Citizen Card Gap Filler: RECENT ACTIVITY Mini-Preview */}
            <div style={{
              borderTop: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
              paddingTop: '8px',
              marginTop: '4px',
            }}>
              <div style={{
                fontSize: '8px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                color: isDark ? '#6b7280' : '#6b7280',
                letterSpacing: '0.06em',
                marginBottom: '5px',
              }}>
                RECENT CITIZEN REPORTS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', fontFamily: '"JetBrains Mono", monospace' }}>
                  <span style={{ color: isDark ? '#d1d5db' : '#0a0a0a' }}>JP-W01 Water Main Leak</span>
                  <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '1px 4px', fontSize: '7.5px', fontWeight: 800 }}>RESOLVED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', fontFamily: '"JetBrains Mono", monospace' }}>
                  <span style={{ color: isDark ? '#d1d5db' : '#0a0a0a' }}>JP-T02 MI Road Congestion</span>
                  <span style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '1px 4px', fontSize: '7.5px', fontWeight: 800 }}>IN PROGRESS</span>
                </div>
              </div>
            </div>

            {/* Action Button positioned with normal tight 14px top margin */}
            <button
              onClick={() => onSelectRole('citizen')}
              style={{
                backgroundColor: isDark ? '#1c202c' : '#4fc9dc',
                color: isDark ? '#ffffff' : '#0a0a0a',
                border: `1px solid ${isDark ? '#3a3d45' : '#0a0a0a'}`,
                padding: '10px 14px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isDark ? '2px 2px 0px #3a3d45' : '2px 2px 0px #0a0a0a',
                marginTop: '14px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              LAUNCH CITIZEN PORTAL →
            </button>
          </div>

          {/* Card 2: Municipal Staff */}
          <div style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8',
            border: `2px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? '3px 3px 0px #2a2f3d' : '3px 3px 0px #0a0a0a',
            height: 'auto',
            boxSizing: 'border-box',
          }}>
            <div style={{
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 800,
              color: '#ffffff',
              backgroundColor: '#ea3b1b',
              display: 'inline-block',
              padding: '3px 7px',
              marginBottom: '6px',
              alignSelf: 'flex-start',
              border: '1px solid #0a0a0a',
            }}>
              ROLE 02 // RESTRICTED OFFICER ACCESS
            </div>
            <h2 style={{ margin: '0 0 4px 0', lineHeight: 1.2 }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}>Municipal</span>{' '}
              <span style={{ fontSize: '17px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Command Center</span>
            </h2>
            <p style={{
              fontSize: '11px',
              color: isDark ? '#9ca3af' : '#3a3a3a',
              lineHeight: 1.35,
              margin: '0 0 8px 0',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}>
              Full operational control room view. Live spatial telemetry nodes, real-time anomaly propagation, decision rail AI dispatch, and city health KPIs.
            </p>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 10px 0',
              fontSize: '10px',
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#ea3b1b', fontWeight: 800 }}>✓</span> Real-Time Leaflet Spatial Map & Topology
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#ea3b1b', fontWeight: 800 }}>✓</span> One-Click Decision Rail Emergency Dispatch
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#ea3b1b', fontWeight: 800 }}>✓</span> Live Anomaly Simulation & Resolution Loop
              </li>
            </ul>

            {/* Municipal Card Gap Filler: LIVE SYSTEM METRICS Row */}
            <div style={{
              borderTop: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
              paddingTop: '8px',
              marginTop: '4px',
            }}>
              <div style={{
                fontSize: '8px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                color: isDark ? '#6b7280' : '#6b7280',
                letterSpacing: '0.06em',
                marginBottom: '5px',
              }}>
                CONTROL ROOM TELEMETRY METRICS
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
                padding: '5px 8px',
                border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
                borderRadius: '0px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: isDark ? '#ffffff' : '#0a0a0a' }}>{nodes.length}</div>
                  <div style={{ fontSize: '7.5px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>NODES</div>
                </div>
                <div style={{ width: '1px', backgroundColor: isDark ? '#2a2f3d' : '#0a0a0a' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: '#ea3b1b' }}>
                    {openIncidentsCount}
                  </div>
                  <div style={{ fontSize: '7.5px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>ANOMALIES</div>
                </div>
                <div style={{ width: '1px', backgroundColor: isDark ? '#2a2f3d' : '#0a0a0a' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: '#00a5e3' }}>
                    {healthVal}%
                  </div>
                  <div style={{ fontSize: '7.5px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>HEALTH INDEX</div>
                </div>
              </div>
            </div>

            {/* Action Button positioned with normal tight 14px top margin (Critical Reserved Red-Orange) */}
            <button
              onClick={() => setShowStaffModal(true)}
              style={{
                backgroundColor: '#ea3b1b',
                color: '#ffffff',
                border: `1px solid ${isDark ? '#ea3b1b' : '#0a0a0a'}`,
                padding: '10px 14px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isDark ? '2px 2px 0px #7f1d1d' : '2px 2px 0px #0a0a0a',
                marginTop: '14px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              OFFICER AUTHENTICATION →
            </button>
          </div>
        </section>
      </main>

      {/* 4. FOOTER META BAR (Fixed 24px Height, Full Bleed) */}
      <footer style={{
        height: '24px',
        backgroundColor: isDark ? '#12141a' : '#f5f2e8',
        borderTop: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 64px)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        color: isDark ? '#6b7280' : '#6b7280',
        letterSpacing: '0.05em',
        flexShrink: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div>SYSTEM STATUS: OPERATIONAL // 26.9124° N, 75.7873° E // v2.4</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#" style={{ color: isDark ? '#6b7280' : '#6b7280', textDecoration: 'none' }}>PRIVACY</a>
          <span>//</span>
          <a href="#" style={{ color: isDark ? '#6b7280' : '#6b7280', textDecoration: 'none' }}>TERMS</a>
          <span>//</span>
          <a href="#" style={{ color: isDark ? '#6b7280' : '#6b7280', textDecoration: 'none' }}>STATUS</a>
        </div>
      </footer>

      {/* Staff Login Modal */}
      {showStaffModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div className="beveled-3d-frame" style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, color: '#ea3b1b' }}>
                  RESTRICTED MUNICIPAL ACCESS
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: isDark ? '#f3f4f6' : '#0a0a0a' }}>
                  Officer Authentication
                </h3>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: isDark ? '#9ca3af' : '#0a0a0a' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#3a3a3a', fontFamily: '"JetBrains Mono", monospace', marginBottom: '16px', lineHeight: 1.4 }}>
              Demo Environment — use the pre-filled credentials to continue.
            </p>

            <form onSubmit={handleStaffLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', marginBottom: '4px', color: isDark ? '#9ca3af' : '#3a3a3a' }}>
                  OFFICER ID
                </label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontFamily: '"JetBrains Mono", monospace',
                    border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
                    backgroundColor: isDark ? '#1c202c' : '#f0ede4',
                    color: isDark ? '#f3f4f6' : '#0a0a0a',
                    boxSizing: 'border-box',
                    borderRadius: '0px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', marginBottom: '4px', color: isDark ? '#9ca3af' : '#3a3a3a' }}>
                  STATION / SUBSTATION CODE
                </label>
                <input
                  type="text"
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontFamily: '"JetBrains Mono", monospace',
                    border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
                    backgroundColor: isDark ? '#1c202c' : '#f0ede4',
                    color: isDark ? '#f3f4f6' : '#0a0a0a',
                    boxSizing: 'border-box',
                    borderRadius: '0px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', marginBottom: '4px', color: isDark ? '#9ca3af' : '#3a3a3a' }}>
                  PASSKEY / ACCESS PIN
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter any passcode"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontFamily: '"JetBrains Mono", monospace',
                    border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
                    backgroundColor: isDark ? '#1c202c' : '#f0ede4',
                    color: isDark ? '#f3f4f6' : '#0a0a0a',
                    boxSizing: 'border-box',
                    borderRadius: '0px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
                    color: isDark ? '#f3f4f6' : '#0a0a0a',
                    border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
                    borderRadius: '0px',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    backgroundColor: '#ea3b1b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0px',
                    cursor: 'pointer',
                  }}
                >
                  AUTHENTICATE →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.75)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px',
        }}>
          <div className="beveled-3d-frame" style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8', width: '100%', maxWidth: '520px', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: isDark ? '#ffffff' : '#0a0a0a' }}>
                🔍 SYSTEM QUICK SEARCH
              </span>
              <button onClick={() => setShowSearchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#9ca3af' : '#0a0a0a' }}>✕</button>
            </div>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node ID, title, or keyword..."
              style={{
                width: '100%', padding: '10px 12px', fontSize: '13px', fontFamily: '"JetBrains Mono", monospace',
                border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`, backgroundColor: isDark ? '#1c202c' : '#ffffff',
                color: isDark ? '#ffffff' : '#0a0a0a', marginBottom: '16px', boxSizing: 'border-box', borderRadius: '0px',
              }}
            />
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: '#6b7280' }}>NODES ({filteredNodes.length})</div>
              {filteredNodes.slice(0, 4).map(node => (
                <div key={node.id} onClick={() => { setShowSearchModal(false); onSelectRole('dashboard'); }} style={{
                  padding: '8px 10px', backgroundColor: isDark ? '#1c202c' : '#ffffff', border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace',
                }}>
                  <span>{node.name} ({node.id})</span>
                  <span style={{ color: node.status === 'anomaly' ? '#ea3b1b' : '#10b981', fontWeight: 800 }}>{node.status.toUpperCase()}</span>
                </div>
              ))}
              <div style={{ fontSize: '9px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: '#6b7280', marginTop: '6px' }}>INCIDENTS ({filteredIncidents.length})</div>
              {filteredIncidents.slice(0, 3).map(inc => (
                <div key={inc.id} onClick={() => { setShowSearchModal(false); onSelectRole('dashboard'); }} style={{
                  padding: '8px 10px', backgroundColor: isDark ? '#1c202c' : '#ffffff', border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace',
                }}>
                  <span>{inc.title}</span>
                  <span style={{ color: '#ea3b1b', fontWeight: 800 }}>OPEN</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {showNotifDrawer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.75)', display: 'flex',
          justifyContent: 'flex-end', zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8', width: '100%', maxWidth: '360px', height: '100%', padding: '24px',
            boxSizing: 'border-box', borderLeft: `2px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, paddingBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: isDark ? '#ffffff' : '#0a0a0a' }}>
                🔔 SYSTEM LIVE ALERTS ({openIncidentsCount})
              </span>
              <button onClick={() => setShowNotifDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#9ca3af' : '#0a0a0a' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidents.map(inc => (
                <div key={inc.id} style={{
                  padding: '10px', backgroundColor: isDark ? '#1c202c' : '#ffffff', border: `1px solid ${inc.status === 'open' ? '#ea3b1b' : '#d5d0c3'}`,
                  borderRadius: '0px',
                }}>
                  <div style={{ fontSize: '8px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: inc.status === 'open' ? '#ea3b1b' : '#10b981', marginBottom: '2px' }}>
                    {inc.status === 'open' ? '⚠ ALERT' : '✓ RESOLVED'} // {inc.id}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: '"Space Grotesk", sans-serif', color: isDark ? '#ffffff' : '#0a0a0a', marginBottom: '4px' }}>
                    {inc.title}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>
                    {inc.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About System Specs Modal */}
      {showAboutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.75)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px',
        }}>
          <div className="beveled-3d-frame" style={{
            backgroundColor: isDark ? '#161922' : '#f5f2e8', width: '100%', maxWidth: '480px', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: '#4fc9dc' }}>
                  CIVICTWIN PLATFORM SPECS
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: isDark ? '#ffffff' : '#0a0a0a' }}>
                  v2.4 Urban Intelligence Engine
                </h3>
              </div>
              <button onClick={() => setShowAboutModal(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: isDark ? '#9ca3af' : '#0a0a0a' }}>✕</button>
            </div>
            <div style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6, color: isDark ? '#d1d5db' : '#374151', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>● BOUNDING BOX: 26.8600°N - 26.9250°N / 75.7400°E - 75.8191°E</div>
              <div>● TELEMETRY NODES: {nodes.length} Active Spatial Sensors</div>
              <div>● REFRESH RATE: 100ms - 200ms WebSocket Sync</div>
              <div>● AI ENGINE: Neural Spatial Risk & Anomaly Predictor</div>
              <div>● OPERATIONAL STATUS: ONLINE // 100% UP-TIME</div>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              style={{
                marginTop: '20px', width: '100%', padding: '10px', fontSize: '11px', fontWeight: 800,
                fontFamily: '"JetBrains Mono", monospace', backgroundColor: '#0a0a0a', color: '#ffffff', border: 'none', cursor: 'pointer',
              }}
            >
              CLOSE SPECIFICATIONS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
