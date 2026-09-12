import React from 'react';
import { MapPin, ShieldAlert, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      padding: '16px 20px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
        }}>
          <ShieldAlert size={22} color="#FFF" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            CivicTwin <span style={{ color: '#06B6D4', fontSize: '0.75rem', fontWeight: 600 }}>PWA</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#06B6D4" /> NIT Delhi Ward
          </p>
        </div>
      </div>

      <nav style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.7)', padding: '4px', borderRadius: '12px' }}>
        <button
          onClick={() => setActiveTab('report')}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'report' ? '#06B6D4' : 'transparent',
            color: activeTab === 'report' ? '#FFF' : '#94A3B8',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Report
        </button>
        <button
          onClick={() => setActiveTab('map')}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'map' ? '#06B6D4' : 'transparent',
            color: activeTab === 'map' ? '#FFF' : '#94A3B8',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Nearby Map
        </button>
      </nav>
    </header>
  );
}
