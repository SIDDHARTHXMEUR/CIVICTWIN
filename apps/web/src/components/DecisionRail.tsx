import { useState } from 'react';
import { useStore } from '../store';
import type { Incident } from '../store';

function getRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export default function DecisionRail() {
  const incidents = useStore(state => state.incidents);
  const executeIncidentAction = useStore(state => state.executeIncidentAction);
  const setFocusedIncidentId = useStore(state => state.setFocusedIncidentId);
  const focusedIncidentId = useStore(state => state.focusedIncidentId);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'critical' | 'warnings' | 'insights'>('critical');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeDomain = useStore(state => state.activeDomain);
  const openIncidents = incidents.filter(i => ['reported', 'classified', 'in_progress', 'open'].includes(i.status) && (activeDomain === 'all' || activeDomain === 'intelligence' || i.category.includes(activeDomain)));
  const resolvedIncidents = incidents.filter(i => ['resolved', 'verified'].includes(i.status) && (activeDomain === 'all' || activeDomain === 'intelligence' || i.category.includes(activeDomain)));
  const criticalIncidents = openIncidents.filter(i => i.tab === 'critical');
  const warningIncidents = openIncidents.filter(i => i.tab === 'warnings');
  const activeTabIncidents = openIncidents.filter(i => i.tab === activeTab);

  const optimalRoute = useStore(state => state.optimalRoute);
  const fetchOptimalRoute = useStore(state => state.fetchOptimalRoute);

  const handleActionClick = (actionLabel: string, incidentId: string, isPrimary: boolean) => {
    setToastMessage(`✓ COMMAND EXECUTED: ${actionLabel.toUpperCase()} // TELEMETRY SYNCED`);
    setTimeout(() => setToastMessage(null), 3500);

    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      fetchOptimalRoute(inc.id, inc.lat || 26.9124, inc.lng || 75.7873, inc.category, String(inc.severity));
    }

    // Call the synchronous optimistic action (no setTimeout delay)
    executeIncidentAction(incidentId, actionLabel, isPrimary);
  };

  return (
    <aside className="beveled-3d-frame" style={{
      width: '300px',
      backgroundColor: isDark ? '#12141a' : '#f5f2e8',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: '"Hanken Grotesk", sans-serif',
      borderRadius: '0px',
      position: 'relative',
      transition: 'background-color 0.2s ease',
    }}>
      {/* Action Dispatch Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '-42px',
          right: '0px',
          zIndex: 1000,
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '6px 12px',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 800,
          border: '1px solid #ffffff',
          borderRadius: '0px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
          animation: 'slideUpFade 0.3s ease-out',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header — 20px bold Space Grotesk title with numeric index 03 / (single line) */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
        backgroundColor: isDark ? '#161922' : '#e8e4d8',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <span style={{
            fontSize: '13px',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            color: isDark ? '#6b7280' : '#6b7280',
          }}>
            03 /
          </span>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            fontFamily: '"Space Grotesk", sans-serif',
            color: isDark ? '#f3f4f6' : '#0a0a0a',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            DECISION RAIL
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace', marginTop: '4px' }}>
          AI Incident Alerts & Triage
        </div>
      </div>

      {/* Interactive Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`, backgroundColor: isDark ? '#161922' : '#e8e4d8' }}>
        {[
          { key: 'critical', label: 'CRITICAL', icon: '⚠', count: criticalIncidents.length, color: '#ea3b1b' },
          { key: 'warnings', label: 'WARNINGS', icon: '⚡', count: warningIncidents.length, color: '#f59e0b' },
          { key: 'insights', label: 'INSIGHTS', icon: '💡', count: 1, color: isDark ? '#4fc9dc' : '#0090b8' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <div 
              key={tab.key} 
              onClick={() => setActiveTab(tab.key as 'critical' | 'warnings' | 'insights')}
              style={{
                flex: 1,
                padding: '8px 2px',
                textAlign: 'center',
                fontSize: '9px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? tab.color : '#9ca3af',
                borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                borderRadius: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{
                  fontSize: '8px',
                  fontFamily: '"JetBrains Mono", monospace',
                  backgroundColor: isActive ? tab.color : isDark ? '#2a2f3d' : '#eeeee6',
                  color: isActive ? '#ffffff' : '#6b7280',
                  padding: '0 4px',
                  borderRadius: '0px',
                }}>
                  {tab.count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Alert Cards Container */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeTab === 'insights' ? (
          <InsightsCard isDark={isDark} />
        ) : activeTabIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: '#9ca3af', fontSize: '10px', letterSpacing: '0.05em', fontFamily: '"JetBrains Mono", monospace' }}>
            NO ACTIVE {activeTab.toUpperCase()} ALERTS
          </div>
        ) : (
          <>
            {activeTabIncidents.map(incident => (
              <AlertCard
                key={incident.id}
                incident={incident}
                onAction={(label, isPrimary) => handleActionClick(label, incident.id, isPrimary)}
                onFocus={() => setFocusedIncidentId(incident.id)}
                isFocused={focusedIncidentId === incident.id}
                isDark={isDark}
              />
            ))}
          </>
        )}

        {/* Predictive model card shown on warnings tab */}
        {activeTab === 'warnings' && <PredictiveCard isDark={isDark} onAction={(lbl) => setToastMessage(`✓ PREDICTIVE REROUTE DISPATCHED: ${lbl}`)} />}

        {/* Resolved Today Section */}
        {resolvedIncidents.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#6b7280' : '#9ca3af', fontFamily: '"JetBrains Mono", monospace', marginBottom: '8px' }}>
              RESOLVED TODAY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {resolvedIncidents.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                  <div style={{ fontSize: '11px', color: isDark ? '#f3f4f6' : '#1a1c17', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {i.title}
                  </div>
                  <div style={{ fontSize: '9px', color: isDark ? '#9ca3af' : '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>
                    {getRelativeTime(i.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div style={{
        padding: '8px 12px',
        borderTop: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
        backgroundColor: isDark ? '#161922' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '0px',
      }}>
        <div style={{
          width: '20px', height: '20px',
          backgroundColor: isDark ? '#2a2f3d' : '#111318',
          borderRadius: '0px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#fff', fontWeight: 700, flexShrink: 0,
          fontFamily: '"JetBrains Mono", monospace',
        }}>AI</div>
        <span style={{ fontSize: '10px', color: '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>Engine Online</span>
        <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '0px', backgroundColor: '#10b981', flexShrink: 0 }}></span>
      </div>
    </aside>
  );
}

function AlertCard({ incident, onAction, onFocus, isFocused, isDark }: {
  incident: Incident;
  onAction: (label: string, isPrimary: boolean) => void;
  onFocus?: () => void;
  isFocused?: boolean;
  isDark: boolean;
}) {
  const isCritical = incident.tab === 'critical';
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const accentColor = isCritical ? '#ea3b1b' : '#f59e0b';
  const headerBg = isDark ? '#1c202c' : '#2a2f3d';
  const tagText = isCritical ? '⚠ PHYSICAL INFRASTRUCTURE' : '⚡ MOBILITY GRIDLOCK';
  const severityVal = incident.severity || (isCritical ? 8 : 4);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="beveled-3d-frame"
      style={{
        backgroundColor: isDark ? '#161922' : '#f5f2e8',
        borderRadius: '0px',
        overflow: 'hidden',
        flexShrink: 0,
        outline: isFocused ? `2px solid #4fc9dc` : isHovered ? `1px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}` : 'none',
        outlineOffset: '-1px',
        transform: isHovered ? 'translateX(-2px)' : 'none',
        transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), outline 0.15s ease, box-shadow 0.15s ease',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* Card Header — click to focus map */}
      <div
        onClick={onFocus}
        style={{
          backgroundColor: headerBg,
          borderLeft: `4px solid ${accentColor}`,
          padding: '8px 10px',
          borderRadius: '0px',
          cursor: 'crosshair',
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '8px', fontWeight: 800, color: accentColor, letterSpacing: '0.08em', marginBottom: '2px', fontFamily: '"JetBrains Mono", monospace' }}>
              {tagText}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, fontFamily: '"Space Grotesk", sans-serif' }}>
              {incident.title}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.8)', fontFamily: '"JetBrains Mono", monospace' }}>
              {getRelativeTime(incident.updatedAt)}
            </div>
            <div style={{ 
              fontSize: '8px', 
              fontWeight: 800, 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: '#ffffff', 
              padding: '2px 4px', 
              marginTop: '4px',
              fontFamily: '"JetBrains Mono", monospace' 
            }}>
              REPORTED BY: {incident.reportCount}
            </div>
            {incident.status !== 'reported' && incident.status !== 'open' && (
              <div style={{ 
                fontSize: '8px', 
                fontWeight: 800, 
                backgroundColor: accentColor, 
                color: '#ffffff', 
                padding: '2px 4px', 
                marginTop: '4px',
                fontFamily: '"JetBrains Mono", monospace' 
              }}>
                {incident.status.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Severity Meter Bar */}
      <div style={{
        padding: '6px 10px 0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
      }}>
        <span style={{ fontSize: '8px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, color: isDark ? '#cbd5e1' : '#1e293b' }}>
          SEVERITY {severityVal}/10
        </span>
        <div style={{ display: 'flex', gap: '3px', flex: 1, maxWidth: '120px' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: i < severityVal 
                  ? (severityVal >= 7 ? '#ea3b1b' : severityVal >= 4 ? '#f59e0b' : '#10b981')
                  : (isDark ? '#2a2f3d' : '#e5e7eb'),
                borderRadius: '0px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '8px 10px' }}>
        <p style={{ fontSize: '10px', color: isDark ? '#cbd5e1' : '#111827', fontWeight: 500, lineHeight: 1.5, marginBottom: '8px' }}>
          {incident.description}
        </p>

        {/* Expandable Root Cause / Sensor Info */}
        <div style={{ marginBottom: '8px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '8px',
              fontFamily: '"JetBrains Mono", monospace',
              color: isDark ? '#4fc9dc' : '#005073',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>{showDetails ? '▼ HIDE ROOT CAUSE' : '▶ VIEW ROOT CAUSE & TELEMETRY'}</span>
          </button>
          {showDetails && (
            <div style={{
              marginTop: '4px',
              padding: '6px',
              backgroundColor: isDark ? '#1c202c' : '#ffffff',
              border: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
              fontSize: '8.5px',
              fontFamily: '"JetBrains Mono", monospace',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}>
              <div><strong>ROOT CAUSE:</strong> {incident.rootCause || 'Underground pressure sensor spike + hydraulic differential.'}</div>
              {incident.lat && incident.lng && (
                <div style={{ marginTop: '2px', color: isDark ? '#94a3b8' : '#334155' }}>
                  GPS: {incident.lat.toFixed(4)}°N, {incident.lng.toFixed(4)}°E
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {incident.actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onAction(action.label, action.kind === 'primary')}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: '8.5px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1.2,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '28px',
                boxSizing: 'border-box',
                fontFamily: '"JetBrains Mono", monospace',
                borderRadius: '0px',
                cursor: 'pointer',
                border: action.kind === 'primary'
                  ? `1px solid ${accentColor}`
                  : `1px solid ${isDark ? '#2a2f3d' : '#d2c3c3'}`,
                backgroundColor: action.kind === 'primary'
                  ? accentColor
                  : isDark ? '#1c202c' : '#ffffff',
                color: action.kind === 'primary' ? '#ffffff' : isDark ? '#f3f4f6' : '#1a1c17',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (action.kind !== 'primary') {
                  e.currentTarget.style.borderColor = isDark ? '#4fc9dc' : '#0a0a0a';
                  e.currentTarget.style.color = isDark ? '#4fc9dc' : '#0a0a0a';
                } else {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (action.kind !== 'primary') {
                  e.currentTarget.style.borderColor = isDark ? '#2a2f3d' : '#d2c3c3';
                  e.currentTarget.style.color = isDark ? '#f3f4f6' : '#1a1c17';
                } else {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PredictiveCard({ isDark, onAction }: { isDark: boolean; onAction: (lbl: string) => void }) {
  return (
    <div className="beveled-3d-frame" style={{
      backgroundColor: isDark ? '#161922' : '#fafaf1',
      borderRadius: '0px',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{
        backgroundColor: isDark ? '#1c202c' : '#eeeee6',
        padding: '8px 10px',
        borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d2c3c3'}`,
        borderRadius: '0px',
      }}>
        <div style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#38bdf8' : '#00364e', letterSpacing: '0.08em', marginBottom: '2px', fontFamily: '"JetBrains Mono", monospace' }}>
          ⚡ PREDICTIVE MODEL
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#f3f4f6' : '#1a1c17', lineHeight: 1.2, fontFamily: '"Space Grotesk", sans-serif' }}>
          Predicted Congestion Cascade
        </div>
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p style={{ fontSize: '10px', color: isDark ? '#9ca3af' : '#4e4444', lineHeight: 1.5, marginBottom: '8px' }}>
          MI Road anomaly likely to cascade to Ajmeri Gate within 45 mins.
        </p>
        <button
          onClick={() => onAction('REROUTE LOGISTICS')}
          style={{
            width: '100%',
            padding: '6px 4px',
            fontSize: '8.5px',
            fontWeight: 800,
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'center',
            fontFamily: '"JetBrains Mono", monospace',
            border: `1px solid ${isDark ? '#2a2f3d' : '#1a1c17'}`,
            borderRadius: '0px',
            backgroundColor: isDark ? '#1c202c' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#1a1c17',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            minHeight: '28px',
            boxSizing: 'border-box',
          }}
        >
          🗺 REROUTE LOGISTICS
        </button>
      </div>
    </div>
  );
}

function InsightsCard({ isDark }: { isDark: boolean }) {
  return (
    <div className="beveled-3d-frame" style={{
      backgroundColor: isDark ? '#082f49' : '#e0f2fe',
      padding: '10px',
      borderRadius: '0px',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: '8px', fontWeight: 800, color: isDark ? '#7dd3fc' : '#0369a1', letterSpacing: '0.08em', marginBottom: '4px', fontFamily: '"JetBrains Mono", monospace' }}>
        💡 SYSTEM OPTIMIZATION INSIGHT
      </div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#38bdf8' : '#0369a1', lineHeight: 1.2, marginBottom: '6px', fontFamily: '"Space Grotesk", sans-serif' }}>
        West Zone AQI Stabilization
      </div>
      <p style={{ fontSize: '10px', color: isDark ? '#bae6fd' : '#0284c7', lineHeight: 1.5, margin: 0 }}>
        Air Quality Index across West Jaipur sensors improved by 1.2% following traffic green-wave signal adjustment.
      </p>
    </div>
  );
}
