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

export type AppView = 'gateway' | 'dashboard' | 'citizen';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('gateway');
  const theme = useStore(state => state.theme);
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const newIncidentAlert = useStore(state => state.newIncidentAlert);
  const clearNewIncidentAlert = useStore(state => state.clearNewIncidentAlert);
  const realtimeConnected = useStore(state => state.realtimeConnected);
  const simulateAIPrediction = useStore(state => state.simulateAIPrediction);
  const isDark = theme === 'dark';

  // Load data + subscribe to realtime on mount
  useEffect(() => {
    useStore.getState().loadFromSupabase();
    const unsubscribe = useStore.getState().subscribeToRealtime();
    return () => { unsubscribe(); };
  }, []);

  // Auto-dismiss alert after 6s
  useEffect(() => {
    if (newIncidentAlert) {
      const t = setTimeout(() => clearNewIncidentAlert(), 6000);
      return () => clearTimeout(t);
    }
  }, [newIncidentAlert]);

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

      {/* Live Incident Toast Alert */}
      {newIncidentAlert && (
        <div
          onClick={clearNewIncidentAlert}
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            backgroundColor: newIncidentAlert.startsWith('🤖') ? '#1e3a5f' : '#7f1d1d',
            color: '#ffffff',
            padding: '10px 20px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            border: newIncidentAlert.startsWith('🤖') ? '1px solid #3b82f6' : '1px solid #ef4444',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            animation: 'rhythmicPulse 1.5s ease-in-out infinite',
            maxWidth: '600px',
            textAlign: 'center',
          }}
        >
          {newIncidentAlert} <span style={{ opacity: 0.6, marginLeft: '12px', fontSize: '10px' }}>CLICK TO DISMISS</span>
        </div>
      )}

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

        {/* Footer with Realtime Status + AI Predict Button */}
        <footer style={{
          height: '28px',
          backgroundColor: isDark ? '#12141a' : '#ffffff',
          border: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          color: isDark ? '#6b7280' : '#9ca3af',
          letterSpacing: '0.05em',
          flexShrink: 0,
          gap: '12px',
        }}>
          <div>JAIPUR METRO NODE // v2.4 // 26.9124° N, 75.7873° E</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={simulateAIPrediction}
              style={{
                padding: '2px 10px',
                fontSize: '9px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              🤖 SIMULATE AI PREDICTION
            </button>
            <span>SYS_STABLE</span>
            <span>LATENCY: 12ms</span>
            <span style={{ color: realtimeConnected ? '#10b981' : '#f59e0b' }}>
              {realtimeConnected ? '● REALTIME LIVE' : '◌ CONNECTING...'}
            </span>
          </div>
        </footer>
      </main>

      {/* 03: Right Decision Rail */}
      <DecisionRail />
    </div>
  );
}

export default App;
