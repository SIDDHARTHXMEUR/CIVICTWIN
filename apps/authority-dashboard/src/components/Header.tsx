import React from 'react';
import { ShieldCheck, Activity, Radio, Cpu, RefreshCw } from 'lucide-react';

interface Props {
  wsConnected: boolean;
  onRefresh: () => void;
  activeView: 'dashboard' | 'report';
  onViewChange: (view: 'dashboard' | 'report') => void;
}

export const Header: React.FC<Props> = ({ wsConnected, onRefresh, activeView, onViewChange }) => {
  return (
    <header className="glass-card" style={{
      margin: '16px 20px',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
        }}>
          <ShieldCheck size={26} color="#FFF" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              CivicTwin <span style={{ color: '#06B6D4', fontSize: '0.85rem' }}>Command Center</span>
            </h1>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#06B6D4',
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontFamily: 'var(--font-mono)'
            }}>
              NIT Delhi Ward #14
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
            AI Urban Intelligence Layer for Responsive Cities
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <button onClick={() => onViewChange('dashboard')} style={tabStyle(activeView === 'dashboard')}>Command center</button>
          <button onClick={() => onViewChange('report')} style={tabStyle(activeView === 'report')}>Report an issue</button>
        </div>
        {/* Live WebSocket Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.8rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: wsConnected ? '#10B981' : '#F59E0B',
            boxShadow: wsConnected ? '0 0 10px #10B981' : 'none'
          }} />
          <span style={{ color: wsConnected ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
            {wsConnected ? 'Live Pipeline Connected' : 'Connecting Engine...'}
          </span>
        </div>

        <button
          onClick={onRefresh}
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#F8FAFC',
            padding: '8px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} /> Refresh Data
        </button>

        <div style={{
          padding: '6px 12px',
          borderRadius: '10px',
          background: 'rgba(13, 18, 31, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Cpu size={14} color="#3B82F6" />
          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Authority Admin</span>
        </div>
      </div>
    </header>
  );
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  border: 'none', borderRadius: '7px', cursor: 'pointer', padding: '7px 10px',
  background: active ? 'rgba(6, 182, 212, 0.22)' : 'transparent',
  color: active ? '#67E8F9' : '#94A3B8', fontWeight: 700, fontSize: '0.76rem'
});
