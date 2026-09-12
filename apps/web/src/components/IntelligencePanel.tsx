import React, { useState } from 'react';
import { useStore } from '../store';
import { PaymentGate } from './PaymentGate';
import { PredictiveFailureReport } from './PredictiveFailureReport';

export default function IntelligencePanel() {
  const incidents = useStore(state => state.incidents);
  const executeIncidentAction = useStore(state => state.executeIncidentAction);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  const payments = useStore(state => state.payments);
  const activeDomain = useStore(state => state.activeDomain);
  const activeIncidents = incidents.filter(i => ['reported', 'classified', 'in_progress', 'open'].includes(i.status) && (activeDomain === 'all' || activeDomain === 'intelligence' || i.category.includes(activeDomain)));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const topAnomaly = activeIncidents.length > 0
    ? (activeIncidents[selectedIndex] || activeIncidents[0])
    : null;

  const isPaid = topAnomaly 
    ? payments.some(p => p.resource_path === `prediction-${topAnomaly.id}` && p.status === 'settled') 
    : false;

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
      {/* Scanline Beam Animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #4fc9dc, #ea3b1b, transparent)',
        animation: 'scanline 3s linear infinite',
        zIndex: 10,
      }} />

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
        <span style={{ fontSize: '10px', color: '#10b981', fontFamily: '"JetBrains Mono", monospace', fontWeight: 800 }}>LIVE</span>
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

              <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: '"Space Grotesk", sans-serif', color: isDark ? '#f3f4f6' : '#0a0a0a', lineHeight: 1.2, marginBottom: '4px' }}>
                {topAnomaly.title}
              </div>
              <div style={{ fontSize: '10px', color: isDark ? '#9ca3af' : '#3a3a3a', lineHeight: 1.4 }}>
                {topAnomaly.description}
              </div>
            </div>

            {/* Severity Gauge & Radar Ring */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              backgroundColor: isDark ? '#1c202c' : '#ffffff',
              border: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
            }}>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#9ca3af' : '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>
                  ANOMALY SEVERITY
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: (topAnomaly.severity || 8) >= 7 ? '#ea3b1b' : '#f59e0b', fontFamily: '"Space Grotesk", sans-serif' }}>
                  {topAnomaly.severity || 8}<span style={{ fontSize: '10px', color: '#6b7280' }}>/10 CRITICAL</span>
                </div>
              </div>
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke={isDark ? "#2a2f3d" : "#e5e7eb"} strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke={(topAnomaly.severity || 8) >= 7 ? "#ea3b1b" : "#4fc9dc"}
                  strokeWidth="3"
                  strokeDasharray={`${((topAnomaly.severity || 8) / 10) * 88} 88`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
            </div>

            {/* Impact badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: isDark ? '#2b1010' : '#ffdad6', border: `1px solid ${isDark ? '#7f1d1d' : '#ea3b1b'}` }}>
              <span style={{ fontSize: '8px', fontWeight: 800, color: '#ea3b1b', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>IMPACT</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea3b1b', fontFamily: '"JetBrains Mono", monospace' }}>
                +{Math.max(0, Math.min(100, topAnomaly.impactPct + jitter.impact))}% Risk
              </span>
            </div>

            {/* Confidence badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: '#4fc9dc', border: `1px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}` }}>
              <span style={{ fontSize: '8px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>CONFIDENCE</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0a0a0a', fontFamily: '"JetBrains Mono", monospace' }}>
                {Math.max(0, Math.min(100, topAnomaly.confidencePct + jitter.confidence))}%
              </span>
            </div>

            {/* Recommended Action & Dispatch / Resolved Status */}
            <div style={{
              padding: '10px',
              backgroundColor: isDark ? '#1c202c' : '#ffffff',
              border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#4fc9dc' : '#007090', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                  OPERATIONAL RESOLUTION ACTION
                </span>
                {topAnomaly.status === 'resolved' && (
                  <span style={{ fontSize: '8px', fontWeight: 800, color: '#10b981', fontFamily: '"JetBrains Mono", monospace' }}>
                    ✓ RESOLVED
                  </span>
                )}
              </div>

              <div style={{ fontSize: '10px', color: isDark ? '#f3f4f6' : '#0a0a0a', lineHeight: 1.4, fontWeight: 500 }}>
                {topAnomaly.recommendedAction || "Isolate affected grid node and dispatch field unit."}
              </div>

              {topAnomaly.status !== 'resolved' ? (
                <button
                  onClick={() => {
                    if (!isPaid) {
                      setToastMessage("⚠️ PAYMENT REQUIRED: Complete the x402 payment to unlock AI-assisted dispatch.");
                      setTimeout(() => setToastMessage(null), 3500);
                      return;
                    }
                    executeIncidentAction(topAnomaly.id, 'DISPATCH RESOLUTION', true);
                    setToastMessage("✓ DISPATCH EXECUTED // RESOLUTION DEPLOYED");
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    fontFamily: '"JetBrains Mono", monospace',
                    backgroundColor: isPaid ? (isDark ? '#4fc9dc' : '#0a0a0a') : (isDark ? '#2a2f3d' : '#d5d0c3'),
                    color: isPaid ? '#0a0a0a' : (isDark ? '#6b7280' : '#6b7280'),
                    border: 'none',
                    borderRadius: '0px',
                    cursor: isPaid ? 'pointer' : 'not-allowed',
                    letterSpacing: '0.04em',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isPaid ? 'DISPATCH FIELD RESOLUTION →' : '🔒 COMPLETE PAYMENT TO UNLOCK DISPATCH'}
                </button>
              ) : (
                <div style={{
                  padding: '6px 8px',
                  backgroundColor: isDark ? '#12141a' : '#f5f2e8',
                  border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                  fontSize: '9px',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: isDark ? '#9ca3af' : '#4b5563',
                  lineHeight: 1.5,
                }}>
                  <div style={{ color: isDark ? '#f3f4f6' : '#0a0a0a', fontWeight: 700, marginBottom: '2px' }}>
                    EXECUTION LOG:
                  </div>
                  <div>• Emergency Field Taskforce #04 Dispatched</div>
                  <div>• Sub-surface isolation valve engaged (Pressure stabilized)</div>
                  <div>• Priority green wave routing ETA: 7 Mins</div>
                  <div>• Sensor recalibrated to baseline 0.1% loss</div>
                </div>
              )}
            </div>

            {/* AI Dispatch Solution Report (Shown in native Intelligence tone after payment or dispatch) */}
            {isPaid && (
              <div style={{
                padding: '10px',
                backgroundColor: isDark ? '#1c202c' : '#ffffff',
                border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '9.5px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`, paddingBottom: '4px' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 800, color: isDark ? '#4fc9dc' : '#005073', letterSpacing: '0.06em' }}>
                    AI DISPATCH & OPTIMAL ROUTE SOLUTION
                  </span>
                  <span style={{ fontSize: '8px', color: '#10b981', fontWeight: 800 }}>ACTIVE</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#d1d5db' : '#374151' }}>
                  <span>Assigned Unit:</span>
                  <strong style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}>Rapid Emergency Taskforce #04</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#d1d5db' : '#374151' }}>
                  <span>Estimated Arrival:</span>
                  <strong style={{ color: isDark ? '#4fc9dc' : '#007090' }}>7 MINS (Green Corridor)</strong>
                </div>

                <div style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '8.5px', marginTop: '2px' }}>
                  <strong>Equipped Gear:</strong> De-watering Pump, Sub-surface Acoustic Sensor, Hydraulic Clamp Kit
                </div>

                <div style={{
                  marginTop: '4px',
                  padding: '4px 6px',
                  backgroundColor: isDark ? '#12141a' : '#f5f2e8',
                  border: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
                  fontSize: '8px',
                  color: isDark ? '#9ca3af' : '#4b5563',
                }}>
                  Navigation: Depot Gate 3 → Arterial Bypass 4 → Ring Road Sector 7 → Target Coordinates
                </div>
              </div>
            )}

            {/* AI Predictive Failure Report Payment Gate */}
            <div style={{ borderTop: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, paddingTop: '8px' }}>
              <div style={{ fontSize: '8px', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
                AI PREDICTIVE FAILURE REPORT
              </div>
                <PaymentGate
                  resourceId={`prediction-${topAnomaly.id}`}
                  priceUsdc={0.1}
                  description="AI Predictive Failure Report"
                  isDark={isDark}
                >
                  <PredictiveFailureReport
                    incident={topAnomaly}
                    txHash=""
                    isDark={isDark}
                  />
                </PaymentGate>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
