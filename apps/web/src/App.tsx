import { useState, useEffect } from 'react';
import { useStore } from './store';
import Gateway from './components/Gateway';
import CitizenApp from './components/CitizenApp';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KpiStrip from './components/KpiStrip';
import GridTopologyPanel from './components/GridTopologyPanel';
import IntelligencePanel from './components/IntelligencePanel';
import DecisionRail from './components/DecisionRail';

import CommandPalette from './components/CommandPalette';

export type AppView = 'gateway' | 'dashboard' | 'citizen';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('gateway');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const theme = useStore(state => state.theme);
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const realtimeConnected = useStore(state => state.realtimeConnected);
  const activeDomain = useStore(state => state.activeDomain);
  const simLatency = useStore(state => state.simLatency);
  const isDark = theme === 'dark';

  // Listen for Ctrl+K globally to open palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load data + subscribe to realtime on mount
  useEffect(() => {
    useStore.getState().loadFromSupabase();
    const unsubscribe = useStore.getState().subscribeToRealtime();
    const stopTelemetry = useStore.getState().startTelemetrySimulation();
    return () => { unsubscribe(); stopTelemetry(); };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppView;
      if (['gateway', 'dashboard', 'citizen'].includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'dashboard' && !isAuthenticated) {
      setCurrentView('gateway');
    }
  }, [currentView, isAuthenticated]);

  if (currentView === 'dashboard' && !isAuthenticated) {
    return <Gateway onSelectRole={(role) => setCurrentView(role)} />;
  }

  if (currentView === 'gateway') {
    return <Gateway onSelectRole={(role) => setCurrentView(role)} />;
  }

  if (currentView === 'citizen') {
    return <CitizenApp onNavigate={(view) => setCurrentView(view)} />;
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      fontFamily: '"Hanken Grotesk", sans-serif',
      backgroundColor: isDark ? '#0b0c0e' : '#f0ede4',
      color: isDark ? '#f3f4f6' : '#0a0a0a',
      padding: '6px',
      gap: '6px',
      boxSizing: 'border-box',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>



      {/* 01: Left Sidebar */}
      <Sidebar onNavigate={(view) => setCurrentView(view)} />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, gap: '6px' }}>
        <TopBar onNavigate={(view) => setCurrentView(view)} />
        <KpiStrip />
        <div style={{ flex: 1, display: 'flex', gap: '6px', minHeight: 0, overflow: 'hidden' }}>
          <GridTopologyPanel />
          <IntelligencePanel />
        </div>

        {/* Footer with Realtime Status & Live Command Activity Ticker */}
        <footer style={{
          height: '28px',
          backgroundColor: isDark ? '#12141a' : '#ffffff',
          border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          color: isDark ? '#cbd5e1' : '#1e293b',
          fontWeight: 600,
          letterSpacing: '0.05em',
          flexShrink: 0,
          gap: '12px',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: isDark ? '#4fc9dc' : '#005073', fontWeight: 800 }}>JAIPUR METRO NODE</span>
            <span style={{ color: isDark ? '#94a3b8' : '#334155' }}>// 26.9124° N, 75.7873° E</span>
          </div>

          {/* Scrolling Live Operational Ticker */}
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: isDark ? '#e2e8f0' : '#0f172a', fontWeight: 600, padding: '0 16px' }}>
            <span style={{ animation: 'tickerScroll 20s linear infinite', display: 'inline-block' }}>
              ⚡ TELEMETRY SYNCED // VRPTW ROUTING ENGINE ACTIVE // SUPABASE REALTIME LIVE // 144 SENSORS SCANNING // OPERATIONAL LAYER STABLE
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0, color: isDark ? '#cbd5e1' : '#1e293b' }}>
            <span>SYS_STABLE</span>
            <span>LATENCY: {simLatency}ms</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ position: 'relative', width: '8px', height: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {realtimeConnected && <span className="beacon-ring" style={{ backgroundColor: '#10b981' }} />}
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: realtimeConnected ? '#10b981' : '#d97706',
                  boxShadow: realtimeConnected ? '0 0 6px #10b981' : 'none',
                  transition: 'background-color 0.3s ease'
                }} />
              </div>
              <span style={{ color: realtimeConnected ? '#10b981' : '#d97706', fontWeight: 800 }}>
                {realtimeConnected ? 'REALTIME LIVE' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* 03: Right Decision Rail */}
      {activeDomain !== 'payments' && <DecisionRail />}

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onNavigate={(view) => setCurrentView(view)} 
      />
    </div>
  );
}

export default App;
