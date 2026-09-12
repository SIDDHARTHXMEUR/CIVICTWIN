import React from 'react';
import { Incident } from '../types';
import { AlertOctagon, Users, Activity, Layers } from 'lucide-react';

interface Props {
  incidents: Incident[];
}

export const StatsOverview: React.FC<Props> = ({ incidents }) => {
  const totalOpen = incidents.filter(i => i.status !== 'resolved').length;
  const criticalCount = incidents.filter(i => i.escalation_risk === 'critical' || i.severity_score > 75).length;
  const totalPopulation = incidents.reduce((sum, i) => sum + (i.estimated_affected_population || 0), 0);
  const avgSeverity = incidents.length > 0 
    ? Math.round(incidents.reduce((sum, i) => sum + i.severity_score, 0) / incidents.length)
    : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      margin: '0 20px 16px 20px'
    }}>
      {/* Total Active Incidents */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Layers size={22} color="#06B6D4" />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Active Incidents</p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>{totalOpen}</h2>
        </div>
      </div>

      {/* Critical Risks */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertOctagon size={22} color="#F43F5E" />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Critical Escalations</p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F43F5E' }}>{criticalCount}</h2>
        </div>
      </div>

      {/* Affected Citizens */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Users size={22} color="#F59E0B" />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Impacted</p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>{totalPopulation.toLocaleString()}</h2>
        </div>
      </div>

      {/* Avg City Severity Score */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={22} color="#3B82F6" />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Ward Severity Index</p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#3B82F6' }}>{avgSeverity}<span style={{ fontSize: '0.9rem', color: '#64748B' }}>/100</span></h2>
        </div>
      </div>
    </div>
  );
};
