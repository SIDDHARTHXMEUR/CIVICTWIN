import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Bell, User, Sun, Moon, LogOut, ChevronDown, Plus, Globe } from 'lucide-react';

import { playTactileClick } from '../lib/audioSfx';

interface TopBarProps {
  onNavigate?: (view: 'gateway' | 'dashboard' | 'citizen') => void;
}

export default function TopBar({ onNavigate }: TopBarProps) {
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const activeDomain = useStore(state => state.activeDomain);
  const [lastSync, setLastSync] = useState('2m ago');

  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [cityNotice, setCityNotice] = useState<string | null>(null);
  
  const incidents = useStore(state => state.incidents);
  const setIsAuthenticated = useStore(state => state.setIsAuthenticated);

  const handleExportBriefing = () => {
    playTactileClick();
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      const activeList = incidents.filter(i => i.status !== 'resolved');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>CivicTwin Municipal Operational Briefing — Jaipur Node</title>
          <style>
            body { font-family: 'Space Grotesk', 'Segoe UI', sans-serif; margin: 30px; color: #111; line-height: 1.5; }
            h1 { font-size: 22px; border-bottom: 2px solid #0a0a0a; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-family: monospace; font-size: 11px; color: #555; margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: 800; font-family: monospace; background: #eee; padding: 6px 10px; margin-top: 20px; border-left: 4px solid #005073; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; font-family: monospace; }
            .badge { padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 10px; font-weight: bold; background: #ffe4e6; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>CIVICTWIN MUNICIPAL OPERATIONAL BRIEFING</h1>
          <div class="meta">JAIPUR METRO NODE // LAT 26.9124° N, LNG 75.7873° E // GENERATED: ${new Date().toLocaleString()}</div>

          <div class="section-title">01. EXECUTIVE SUMMARY & CITY HEALTH</div>
          <p>City Health Score: <strong>98% (STABLE)</strong> | Active Unresolved Incidents: <strong>${activeList.length}</strong></p>

          <div class="section-title">02. ACTIVE CRITICAL & WARNING INCIDENTS</div>
          <table>
            <thead>
              <tr><th>INCIDENT ID</th><th>TITLE</th><th>SEVERITY</th><th>REPORTS</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              ${activeList.map(i => `
                <tr>
                  <td><code>${i.id}</code></td>
                  <td><strong>${i.title}</strong><br/><small>${i.description}</small></td>
                  <td><span class="badge">${i.severity}/10</span></td>
                  <td>${i.reportCount}</td>
                  <td><code>${i.status.toUpperCase()}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>window.print();</script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync('just now');
      setTimeout(() => setLastSync('2m ago'), 3000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className="beveled-3d-frame" style={{
      height: '48px',
      backgroundColor: isDark ? '#12141a' : '#f5f2e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      fontFamily: '"Space Grotesk", sans-serif',
      transition: 'background-color 0.2s ease',
      position: 'relative',
      zIndex: 200,
    }}>
      {/* City Notice Toast */}
      {cityNotice && (
        <div style={{
          position: 'absolute',
          top: '52px',
          left: '280px',
          backgroundColor: isDark ? '#1c202c' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#0a0a0a',
          border: '1px solid #4fc9dc',
          padding: '6px 12px',
          fontSize: '9.5px',
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          zIndex: 1000,
        }}>
          {cityNotice}
        </div>
      )}

      {/* Left: Wordmark + View Index + City Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#f3f4f6' : '#0a0a0a', letterSpacing: '-0.02em' }}>
          CivicTwin
        </span>
        
        {/* View Index Stepper */}
        <span style={{
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 800,
          color: '#0a0a0a',
          backgroundColor: '#4fc9dc',
          padding: '2px 8px',
          border: `1px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}`,
          borderRadius: '0px',
          letterSpacing: '0.06em',
        }}>
          VIEW 01 — {activeDomain.toUpperCase()}
        </span>

        {/* City Node Selector Dropdown (Active: Jaipur, with options for upcoming cities) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowCityMenu(!showCityMenu);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            style={{
              fontSize: '10px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              color: isDark ? '#f3f4f6' : '#1a1c17',
              backgroundColor: isDark ? '#1c202c' : '#ffffff',
              padding: '3px 10px',
              border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>📍 JAIPUR METRO NODE</span>
            <ChevronDown size={11} color={isDark ? '#9ca3af' : '#6b7280'} />
          </button>

          {/* Quick Command Palette Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }}
            title="Open Quick Command Palette (Ctrl+K)"
            className="btn-tactile"
            style={{
              marginLeft: '8px',
              fontSize: '10px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              color: isDark ? '#9ca3af' : '#6b7280',
              backgroundColor: isDark ? '#161922' : '#eeeee6',
              padding: '3px 8px',
              border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
              borderRadius: '0px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>COMMANDS</span>
            <span style={{ 
              backgroundColor: isDark ? '#2a2f3d' : '#ffffff', 
              padding: '1px 4px', 
              fontSize: '8px', 
              border: `1px solid ${isDark ? '#3b4252' : '#c4beaf'}`,
              color: isDark ? '#4fc9dc' : '#0a0a0a'
            }}>Ctrl K</span>
          </button>

          {showCityMenu && (
            <div className="beveled-3d-frame fade-slide-in" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '6px',
              width: '270px',
              backgroundColor: isDark ? '#161922' : '#f5f2e8',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              <div style={{ padding: '8px 10px', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, fontSize: '9px', fontWeight: 800, color: '#4fc9dc' }}>
                FEDERATED TWIN REGISTRY
              </div>
              
              {/* Active Jaipur Node */}
              <div style={{
                padding: '8px 10px',
                borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                backgroundColor: isDark ? '#1c202c' : '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#ffffff' : '#0a0a0a' }}>
                  📍 JAIPUR (26.91°N)
                </span>
                <span style={{ fontSize: '8px', color: '#10b981', fontWeight: 800, backgroundColor: '#ecfdf5', padding: '1px 5px', border: '1px solid #10b981' }}>
                  ACTIVE NODE
                </span>
              </div>

              {/* Add New City Option */}
              <div 
                onClick={() => {
                  setCityNotice("🔗 Multi-City Federation Gateway: Ready for deployment in next municipal cohort.");
                  setShowCityMenu(false);
                  setTimeout(() => setCityNotice(null), 4000);
                }}
                style={{
                  padding: '8px 10px',
                  borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#4fc9dc',
                  fontSize: '9.5px',
                  fontWeight: 800,
                }}
              >
                <Plus size={12} />
                <span>+ ADD CITY TWIN NODE</span>
              </div>

              {/* Upcoming Future Cities */}
              {[
                { name: 'NEW DELHI (28.84°N)', tag: 'COMING SOON' },
                { name: 'MUMBAI METRO (19.07°N)', tag: 'COMING SOON' },
                { name: 'BENGALURU TECH (12.97°N)', tag: 'COMING SOON' },
              ].map(city => (
                <div 
                  key={city.name}
                  onClick={() => {
                    setCityNotice(`🔒 ${city.name} is in provisioning queue for future rollout.`);
                    setShowCityMenu(false);
                    setTimeout(() => setCityNotice(null), 3500);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: 0.7,
                    cursor: 'pointer',
                    fontSize: '9px',
                  }}
                >
                  <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>📍 {city.name}</span>
                  <span style={{ fontSize: '7.5px', color: '#6b7280', border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, padding: '1px 4px' }}>
                    {city.tag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Sync + Export + Theme Toggle + Gateway Nav + Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '11px', color: isDark ? '#cbd5e1' : '#1e293b', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>Last Sync: {lastSync}</span>

        {/* Export Briefing Action */}
        <button
          onClick={handleExportBriefing}
          title="Generate Printable Municipal Briefing PDF"
          className="btn-tactile"
          style={{
            backgroundColor: isDark ? '#1c202c' : '#eeeee6',
            color: '#4fc9dc',
            border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
            borderRadius: '0px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", monospace',
            cursor: 'pointer',
          }}
        >
          📄 EXPORT BRIEFING
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            playTactileClick();
            toggleTheme();
          }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="btn-tactile"
          style={{
            backgroundColor: isDark ? '#1c202c' : '#eeeee6',
            color: isDark ? '#f3f4f6' : '#1a1c17',
            border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
            borderRadius: '0px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: '"JetBrains Mono", monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isDark ? <Sun size={12} color="#f59e0b" /> : <Moon size={12} color="#1a1c17" />}
          <span>{isDark ? 'LIGHT' : 'DARK'}</span>
        </button>

        {onNavigate && (
          <button
            onClick={() => onNavigate('gateway')}
            className="btn-tactile"
            style={{
              backgroundColor: isDark ? '#1c202c' : '#eeeee6',
              color: isDark ? '#f3f4f6' : '#1a1c17',
              border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
              borderRadius: '0px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
            }}
          >
            ← GATEWAY
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="btn-tactile"
            style={{ background: showNotifications ? (isDark ? '#2a2f3d' : '#e5e7eb') : 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '0px' }} title="Notifications"
          >
            <Bell size={15} color={isDark ? '#9ca3af' : '#6b7280'} />
            {incidents.some(i => i.status === 'reported') && (
              <span style={{ position: 'absolute', top: '2px', right: '4px', width: '6px', height: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="beacon-ring" style={{ backgroundColor: '#ea3b1b' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: '#ea3b1b', borderRadius: '50%', boxShadow: '0 0 6px #ea3b1b' }}></span>
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="beveled-3d-frame fade-slide-in" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '280px',
              backgroundColor: isDark ? '#161922' : '#f5f2e8',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, fontSize: '10px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                RECENT ALERTS
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {incidents.filter(i => i.status !== 'resolved').slice(0, 5).map(inc => (
                  <div key={inc.id} className="row-interactive" style={{ padding: '8px 12px', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}` }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#f3f4f6' : '#1a1c17' }}>{inc.title}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>{new Date(inc.updatedAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="btn-tactile"
            style={{ background: showProfile ? (isDark ? '#2a2f3d' : '#e5e7eb') : 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '0px' }} title="Officer Profile"
          >
            <User size={15} color={isDark ? '#9ca3af' : '#6b7280'} />
          </button>

          {showProfile && (
            <div className="beveled-3d-frame fade-slide-in" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '200px',
              backgroundColor: isDark ? '#161922' : '#f5f2e8',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>
              <div style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}` }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#f3f4f6' : '#1a1c17', fontFamily: '"Space Grotesk", sans-serif' }}>Control Room Admin</div>
                <div style={{ fontSize: '9px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace', marginTop: '4px' }}>admin@jaipur.twin.gov</div>
              </div>
              <button 
                onClick={() => setIsAuthenticated(false)}
                style={{ 
                  padding: '10px 12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'none', 
                  border: 'none', 
                  color: '#ea3b1b', 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={12} />
                TERMINATE SESSION
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
