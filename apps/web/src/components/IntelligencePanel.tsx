import React, { useState } from 'react';
import { useStore } from '../store';

export default function IntelligencePanel() {
  const incidents = useStore(state => state.incidents);
  const resolveIncident = useStore(state => state.resolveIncident);
  const loopState = useStore(state => state.interactionLoop);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  const activeDomain = useStore(state => state.activeDomain);
  const activeIncidents = incidents.filter(i => i.status === 'open' && (activeDomain === 'all' || activeDomain === 'intelligence' || i.category.includes(activeDomain)));
  const [selectedIndex, setSelectedIndex] = useState(0);

  const topAnomaly = activeIncidents.length > 0
    ? (activeIncidents[selectedIndex] || activeIncidents[0])
    : null;

  React.useEffect(() => {
    if (topAnomaly) {
      useStore.getState().setFocusedIncidentId(topAnomaly.id);
    }
  }, [topAnomaly?.id]);

  return (
    <div className="beveled-3d-frame" style={{
      width: '260px',
      flexShrink: 0,
      backgroundColor: isDark ? '#161922' : '#f5f2e8',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Hanken Grotesk", sans-serif',
      overflow: 'hidden',
      borderRadius: '0px',
      transition: 'background-color 0.2s ease',
    }}>
      {/* Header — 20px bold Space Grotesk title with numeric index 02 / */}
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
        backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '13px',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            color: isDark ? '#6b7280' : '#6b7280',
          }}>
            02 /
          </span>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            fontFamily: '"Space Grotesk", sans-serif',
            color: isDark ? '#f3f4f6' : '#0a0a0a',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            INTELLIGENCE
          </span>
        </div>
        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>📍</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {!topAnomaly ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px', letterSpacing: '0.05em', textAlign: 'center', padding: '16px', fontFamily: '"JetBrains Mono", monospace' }}>
            NO ACTIVE<br />ANOMALIES
          </div>
        ) : (
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Detected Anomaly header & Monospace Incident selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#ea3b1b', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                  DETECTED ANOMALY
                </span>
                {activeIncidents.length > 1 && (
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {activeIncidents.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedIndex(idx);
                          useStore.getState().setFocusedIncidentId(activeIncidents[idx].id);
                        }}
                        style={{
                          padding: '1px 5px',
                          fontSize: '9px',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 800,
                          backgroundColor: (selectedIndex % activeIncidents.length) === idx ? '#4fc9dc' : isDark ? '#2a2f3d' : '#e8e4d8',
                          color: (selectedIndex % activeIncidents.length) === idx ? '#0a0a0a' : isDark ? '#9ca3af' : '#3a3a3a',
                          border: `1px solid ${isDark ? '#3a3d45' : '#0a0a0a'}`,
                          borderRadius: '0px',
                          cursor: 'pointer',
                        }}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Huge sharp title jump in Space Grotesk */}
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: '"Space Grotesk", sans-serif', color: isDark ? '#f3f4f6' : '#0a0a0a', lineHeight: 1.2, marginBottom: '6px' }}>
                {topAnomaly.title}
              </div>
              <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#3a3a3a', lineHeight: 1.5 }}>
                {topAnomaly.description}
              </div>
            </div>

            {/* Impact badge — 0px sharp corners */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: isDark ? '#2b1010' : '#ffdad6', border: `1px solid ${isDark ? '#7f1d1d' : '#ea3b1b'}`, borderRadius: '0px' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#ea3b1b', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>IMPACT</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ea3b1b', fontFamily: '"JetBrains Mono", monospace' }}>
                +{topAnomaly.impactPct}% Risk
              </span>
            </div>

            {/* Confidence badge — Cyan brand chip with 0px sharp corners */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: '#4fc9dc', border: `1px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}`, borderRadius: '0px' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>CONFIDENCE</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0a0a0a', fontFamily: '"JetBrains Mono", monospace' }}>
                {topAnomaly.confidencePct}%
              </span>
            </div>

            {/* Recommended Action & Root Cause — 0px sharp corners */}
            <div style={{
              marginTop: '4px',
              padding: '10px',
              backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
              border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
              borderRadius: '0px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#ea3b1b', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                RECOMMENDED ACTION
              </div>
              <div style={{ fontSize: '11px', color: isDark ? '#f3f4f6' : '#0a0a0a', lineHeight: 1.4, fontWeight: 500, marginBottom: '6px' }}>
                {topAnomaly.recommendedAction || "Isolate affected grid node and dispatch field unit."}
              </div>
              <button
                onClick={() => resolveIncident(topAnomaly.id)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '10px',
                  fontWeight: 800,
                  fontFamily: '"JetBrains Mono", monospace',
                  backgroundColor: '#ea3b1b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                DISPATCH RESOLUTION →
              </button>
            </div>
          </div>
        )}

        {/* Interaction Loop — pinned to bottom via marginTop: auto */}
        <div style={{
          backgroundColor: isDark ? '#0b0c0e' : '#0a0a0a',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexShrink: 0,
          borderRadius: '0px',
          marginTop: 'auto',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
            INTERACTION LOOP
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['observe', 'predict', 'act'].map((stage, idx) => {
              const isActive = loopState.stage === stage;
              const stageLabels = ['OBSERVE', 'PREDICT', 'ACT'];
              return (
                <React.Fragment key={stage}>
                  <span style={{
                    fontSize: '9px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: isActive ? 800 : 500,
                    backgroundColor: isActive ? '#4fc9dc' : 'transparent',
                    color: isActive ? '#0a0a0a' : '#6b7280',
                    padding: isActive ? '2px 6px' : '0px',
                    borderRadius: '0px',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s ease',
                  }}>
                    {stageLabels[idx]}
                  </span>
                  {idx < 2 && (
                    <span style={{ color: '#4b5563', fontSize: '10px', fontFamily: '"JetBrains Mono", monospace' }}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
