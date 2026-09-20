import React, { useState } from 'react';
import { useStore } from '../store';
import { IncidentAuditRecord } from './IncidentAuditRecord';
import { CascadeTimeline } from './CascadeTimeline';

export default function IntelligencePanel() {
  const incidents = useStore(state => state.incidents);
  const executeIncidentAction = useStore(state => state.executeIncidentAction);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  const activeDomain = useStore(state => state.activeDomain);
  const activeIncidents = incidents.filter(i => ['reported', 'classified', 'in_progress', 'open'].includes(i.status) && (activeDomain === 'all' || activeDomain === 'intelligence' || i.category.includes(activeDomain)));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [unlockedTab, setUnlockedTab] = useState<'simulation' | 'audit'>('simulation');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const topAnomaly = activeIncidents.length > 0
    ? (activeIncidents[selectedIndex] || activeIncidents[0])
    : null;

  const [jitter, setJitter] = useState({ impact: 0, confidence: 0 });
  React.useEffect(() => {
    const interval = setInterval(() => {
      setJitter({
        impact: Math.floor(Math.random() * 3) - 1,
        confidence: Math.floor(Math.random() * 3) - 1,
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const focusedIncidentId = useStore(state => state.focusedIncidentId);

  // Sync selected incident when user clicks an alert card in Decision Rail
  React.useEffect(() => {
    if (focusedIncidentId && activeIncidents.length > 0) {
      const idx = activeIncidents.findIndex(i => i.id === focusedIncidentId);
      if (idx !== -1 && idx !== selectedIndex) {
        setSelectedIndex(idx);
      }
    }
  }, [focusedIncidentId, activeIncidents]);

  React.useEffect(() => {
    if (topAnomaly) {
      useStore.getState().setFocusedIncidentId(topAnomaly.id);
    }
  }, [topAnomaly?.id]);

  return (
    <div className="beveled-3d-frame" style={{
      width: '300px',
      flexShrink: 0,
      backgroundColor: isDark ? '#161922' : '#f5f2e8',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Hanken Grotesk", sans-serif',
      overflowX: 'hidden',
      overflowY: 'auto',
      borderRadius: '0px',
      transition: 'background-color 0.2s ease',
      position: 'relative',
    }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          right: '0px',
          zIndex: 1000,
          backgroundColor: '#ea3b1b',
          color: '#ffffff',
          padding: '8px',
          fontSize: '10px',
          fontWeight: 800,
          fontFamily: '"JetBrains Mono", monospace',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {toastMessage}
        </div>
      )}

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
            color: isDark ? '#94a3b8' : '#334155',
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
        <span style={{ fontSize: '10px', color: '#10b981', fontFamily: '"JetBrains Mono", monospace', fontWeight: 800 }}>LIVE</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {!topAnomaly ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px', letterSpacing: '0.05em', textAlign: 'center', padding: '16px', fontFamily: '"JetBrains Mono", monospace' }}>
            NO ACTIVE<br />ANOMALIES
          </div>
        ) : (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* ────────────────────────────────────────────────────────── */}
            {/* 1. DIAGNOSTIC TRIAGE LAYER                                */}
            {/* ────────────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                          padding: '2px 6px',
                          fontSize: '9px',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 800,
                          backgroundColor: (selectedIndex % activeIncidents.length) === idx ? '#4fc9dc' : isDark ? '#2a2f3d' : '#e8e4d8',
                          color: (selectedIndex % activeIncidents.length) === idx ? '#0a0a0a' : isDark ? '#9ca3af' : '#1e293b',
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

              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: '"Space Grotesk", sans-serif', color: isDark ? '#f3f4f6' : '#0a0a0a', lineHeight: 1.25, marginBottom: '3px' }}>
                  {topAnomaly.title}
                </div>
                <div style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#334155', lineHeight: 1.45 }}>
                  {topAnomaly.description}
                </div>
              </div>

              {/* Unified 3-Metric Diagnostic Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                backgroundColor: isDark ? '#1c202c' : '#ffffff',
                border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                borderRadius: '0px',
                overflow: 'hidden',
              }}>
                {/* Col 1: Severity */}
                <div style={{
                  padding: '7px 8px',
                  borderRight: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#94a3b8' : '#475569', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
                    SEVERITY
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: (topAnomaly.severity || 8) >= 7 ? '#ea3b1b' : '#f59e0b',
                    fontFamily: '"Space Grotesk", sans-serif',
                    marginTop: '2px',
                    lineHeight: 1.1,
                  }}>
                    {topAnomaly.severity || 8}<span style={{ fontSize: '9.5px', color: isDark ? '#94a3b8' : '#64748b' }}>/10</span>
                  </div>
                  <div style={{ fontSize: '7.5px', fontWeight: 700, color: (topAnomaly.severity || 8) >= 7 ? '#ea3b1b' : '#b45309', marginTop: '2px', textTransform: 'uppercase' }}>
                    CRITICAL
                  </div>
                </div>

                {/* Col 2: Risk Impact */}
                <div style={{
                  padding: '7px 8px',
                  borderRight: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#94a3b8' : '#475569', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
                    IMPACT
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#ea3b1b',
                    fontFamily: '"Space Grotesk", sans-serif',
                    marginTop: '2px',
                    lineHeight: 1.1,
                  }}>
                    +{Math.max(0, Math.min(100, (topAnomaly.impactPct || 65) + jitter.impact))}%
                  </div>
                  <div style={{ fontSize: '7.5px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    Risk Horizon
                  </div>
                </div>

                {/* Col 3: Bayesian Confidence */}
                <div style={{
                  padding: '7px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#94a3b8' : '#475569', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
                    CONFIDENCE
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#059669',
                    fontFamily: '"Space Grotesk", sans-serif',
                    marginTop: '2px',
                    lineHeight: 1.1,
                  }}>
                    {Math.max(0, Math.min(100, (topAnomaly.confidencePct || 89) + jitter.confidence))}%
                  </div>
                  <div style={{ fontSize: '7.5px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    Sensor Fused
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* 2. DOSSIER & OPERATIONAL AUDIT LAYER                       */}
            {/* ────────────────────────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, paddingTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Clean Tab Switcher */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 2px',
                    }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        fontFamily: '"JetBrains Mono", monospace',
                        color: isDark ? '#94a3b8' : '#334155',
                        letterSpacing: '0.08em',
                      }}>
                        DOSSIER VIEW
                      </span>
                      <span style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        fontFamily: '"JetBrains Mono", monospace',
                        color: unlockedTab === 'simulation' ? '#4fc9dc' : '#059669',
                        backgroundColor: unlockedTab === 'simulation'
                          ? (isDark ? 'rgba(79,201,220,0.15)' : '#e0f2fe')
                          : (isDark ? 'rgba(5,150,105,0.15)' : '#d1fae5'),
                        padding: '1px 6px',
                        borderRadius: '0px',
                        border: `1px solid ${unlockedTab === 'simulation' ? '#4fc9dc' : '#059669'}`,
                      }}>
                        {unlockedTab === 'simulation' ? '● SIMULATION ACTIVE' : '● AUDIT READY'}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      backgroundColor: isDark ? '#1c202c' : '#e8e4d8',
                      border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                      padding: '2px',
                      gap: '2px',
                    }}>
                      <button
                        onClick={() => setUnlockedTab('simulation')}
                        style={{
                          padding: '6px 4px',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace',
                          letterSpacing: '0.03em',
                          backgroundColor: unlockedTab === 'simulation' ? (isDark ? '#2a3245' : '#ffffff') : 'transparent',
                          color: unlockedTab === 'simulation' ? (isDark ? '#ffffff' : '#0a0a0a') : (isDark ? '#94a3b8' : '#475569'),
                          border: 'none',
                          borderRadius: '0px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#4fc9dc' }}>⚡</span>
                        <span>SIMULATION &amp; DISPATCH</span>
                      </button>

                      <button
                        onClick={() => setUnlockedTab('audit')}
                        style={{
                          padding: '6px 4px',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace',
                          letterSpacing: '0.03em',
                          backgroundColor: unlockedTab === 'audit' ? (isDark ? '#2a3245' : '#ffffff') : 'transparent',
                          color: unlockedTab === 'audit' ? (isDark ? '#ffffff' : '#0a0a0a') : (isDark ? '#94a3b8' : '#475569'),
                          border: 'none',
                          borderRadius: '0px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#059669' }}>📋</span>
                        <span>OPERATIONAL AUDIT</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab 1 Content: SIMULATION & DISPATCH */}
                  {unlockedTab === 'simulation' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Automated Dispatch Action Card */}
                      <div style={{
                        padding: '10px',
                        backgroundColor: isDark ? '#1c202c' : '#ffffff',
                        border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '8.5px', fontWeight: 800, color: isDark ? '#4fc9dc' : '#007090', letterSpacing: '0.06em', fontFamily: '"JetBrains Mono", monospace' }}>
                            AUTOMATED DISPATCH EXECUTION
                          </span>
                          {topAnomaly.status === 'resolved' ? (
                            <span style={{ fontSize: '8px', fontWeight: 800, color: '#10b981', fontFamily: '"JetBrains Mono", monospace' }}>
                              ✓ DISPATCHED
                            </span>
                          ) : (
                            <span style={{ fontSize: '8px', fontWeight: 800, color: '#3b82f6', fontFamily: '"JetBrains Mono", monospace' }}>
                              READY
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '10px', color: isDark ? '#f3f4f6' : '#0a0a0a', lineHeight: 1.4, fontWeight: 500 }}>
                          {topAnomaly.recommendedAction || "Isolate affected grid node and dispatch emergency field unit."}
                        </div>

                        {topAnomaly.status !== 'resolved' ? (
                          <button
                            onClick={() => {
                              executeIncidentAction(topAnomaly.id, 'DISPATCH RESOLUTION', true);
                              setToastMessage("✓ AUTOMATED DISPATCH EXECUTED // FIELD UNIT DEPLOYED");
                              setTimeout(() => setToastMessage(null), 3500);
                            }}
                            className="btn-tactile"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: '10px',
                              fontWeight: 800,
                              fontFamily: '"JetBrains Mono", monospace',
                              backgroundColor: isDark ? '#4fc9dc' : '#0a0a0a',
                              color: isDark ? '#0a0a0a' : '#ffffff',
                              border: 'none',
                              borderRadius: '0px',
                              cursor: 'pointer',
                              letterSpacing: '0.04em',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>⚡ EXECUTE MULTI-AGENCY DISPATCH →</span>
                          </button>
                        ) : (
                          /* Unified Active Response Status Card */
                          <div style={{
                            padding: '8px 10px',
                            backgroundColor: isDark ? '#12141a' : '#f8fafc',
                            border: `1px solid ${isDark ? '#2a2f3d' : '#e2e8f0'}`,
                            fontSize: '8.5px',
                            fontFamily: '"JetBrains Mono", monospace',
                            color: isDark ? '#94a3b8' : '#334155',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#f3f4f6' : '#0a0a0a', fontWeight: 700 }}>
                              <span>RESPONSE UNIT:</span>
                              <span style={{ color: '#10b981' }}>Taskforce #04</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#cbd5e1' : '#475569' }}>
                              <span>ACTION:</span>
                              <span>Grid Isolation &amp; Valve Lock</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#4fc9dc' : '#007090', fontWeight: 700 }}>
                              <span>GREEN CORRIDOR ETA:</span>
                              <span>7 Mins</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cascade Timeline Component */}
                      <CascadeTimeline
                        incident={topAnomaly}
                        isDark={isDark}
                      />
                    </div>
                  )}

                  {/* Tab 2 Content: OPERATIONAL AUDIT */}
                  {unlockedTab === 'audit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <IncidentAuditRecord
                        incident={topAnomaly}
                        txHash={`AUDIT-${topAnomaly.id.replace('INC-', '')}-VERIFIED`}
                        isDark={isDark}
                      />
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
