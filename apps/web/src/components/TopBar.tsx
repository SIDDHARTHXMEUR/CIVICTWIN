import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Bell, User, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  onNavigate?: (view: 'gateway' | 'dashboard' | 'citizen') => void;
}

export default function TopBar({ onNavigate }: TopBarProps) {
  const kpis = useStore(state => state.kpis);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const activeDomain = useStore(state => state.activeDomain);
  const cityHealth = kpis.find(k => k.id === 'city-health');
  const [lastSync, setLastSync] = useState('2m ago');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync('just now');
      setTimeout(() => setLastSync('2m ago'), 3000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';
  const healthVal = cityHealth ? Math.round(cityHealth.value) : 98;
  const isCritical = healthVal < 65;
  const isWarning = healthVal >= 65 && healthVal < 80;
  const healthColor = isCritical ? '#ea3b1b' : isWarning ? '#f59e0b' : '#4fc9dc';

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
    }}>
      {/* Left: Wordmark + View Index + Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

        <nav style={{ display: 'flex', gap: '16px' }}>
          {['TELEMETRY', 'ASSETS', 'NODES'].map(item => (
            <a key={item} href="#" style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#6b7280',
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}>{item}</a>
          ))}
        </nav>
      </div>

      {/* Right: Health Badge + Sync + Dark Mode Toggle + Gateway Nav + Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Health Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isDark ? '#0b0c0e' : '#0f1724',
          padding: '4px 10px',
          border: `1px solid ${healthColor}`,
          borderRadius: '0px',
        }}>
          <span style={{ width: '6px', height: '6px', backgroundColor: healthColor, display: 'inline-block' }}></span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: healthColor, fontFamily: '"JetBrains Mono", monospace' }}>
            System Health: {healthVal}%
          </span>
        </div>

        <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: '"JetBrains Mono", monospace' }}>Last Sync: {lastSync}</span>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '0px' }} title="Notifications">
          <Bell size={15} color={isDark ? '#9ca3af' : '#6b7280'} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '0px' }} title="Officer Profile">
          <User size={15} color={isDark ? '#9ca3af' : '#6b7280'} />
        </button>
      </div>
    </header>
  );
}
