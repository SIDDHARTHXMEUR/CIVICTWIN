import { useState } from 'react';
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
  const isDark = theme === 'dark';

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
      {/* 01: Left Sidebar with 3D Beveled Frame */}
      <Sidebar onNavigate={(view) => setCurrentView(view)} />

      {/* Main Content: 3D Beveled Modules Grid */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, gap: '6px' }}>
        {/* TopBar */}
        <TopBar onNavigate={(view) => setCurrentView(view)} />
        
        {/* KpiStrip 3D Modules */}
        <KpiStrip />
        
        {/* Center Split: Topology + Intelligence 3D Modules */}
        <div style={{ flex: 1, display: 'flex', gap: '6px', minHeight: 0, overflow: 'hidden' }}>
          <GridTopologyPanel />
          <IntelligencePanel />
        </div>

        {/* Footer Colophon Meta Bar */}
        <footer style={{
          height: '24px',
          backgroundColor: isDark ? '#12141a' : '#ffffff',
          border: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          color: isDark ? '#6b7280' : '#9ca3af',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          <div>JAIPUR METRO NODE // v2.4 // 26.9124° N, 75.7873° E</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>SYS_STABLE</span>
            <span>LATENCY: 12ms</span>
            <span style={{ color: '#10b981' }}>● LIVE TELEMETRY</span>
          </div>
        </footer>
      </main>

      {/* 03: Right Decision Rail with 3D Beveled Frame */}
      <DecisionRail />
    </div>
  );
}

export default App;
