import React from 'react';
import { Incident } from '../types';
import { AlertCircle, Flame, Users, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

export const ActionQueue: React.FC<Props> = ({
  incidents,
  selectedIncident,
  onSelectIncident
}) => {
  // Sort descending by severity_score
  const sortedIncidents = [...incidents].sort((a, b) => b.severity_score - a.severity_score);

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="#F43F5E" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Prioritized Action Queue ({sortedIncidents.length})
          </h2>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>Sorted by Impact</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedIncidents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
            No incidents match these filters. Select “Show all” in the Filter Matrix to view every incident.
          </div>
        ) : (
          sortedIncidents.map((inc, index) => {
            const isSel = selectedIncident?.id === inc.id;
            let riskClass = 'severity-low';
            if (inc.escalation_risk === 'critical' || inc.severity_score > 75) riskClass = 'severity-critical';
            else if (inc.escalation_risk === 'high' || inc.severity_score > 50) riskClass = 'severity-high';
            else if (inc.escalation_risk === 'medium' || inc.severity_score > 30) riskClass = 'severity-medium';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                style={{
                  background: isSel ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSel ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#F8FAFC',
                      textTransform: 'capitalize'
                    }}>
                      {inc.issue_type.replace('_', ' ')}
                    </span>
                  </div>

                  <span className={`severity-badge ${riskClass}`}>
                    Score {inc.severity_score}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.8rem',
                  color: '#CBD5E1',
                  marginBottom: '10px',
                  lineHeight: '1.3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {inc.ai_summary || inc.root_cause || 'Incident logged around NIT Delhi.'}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.72rem',
                  color: '#94A3B8'
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {inc.report_count} Reports
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={12} color="#F59E0B" /> {inc.growth_velocity.toFixed(1)}/h
                    </span>
                  </div>
                  <span style={{ color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    Inspect <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
