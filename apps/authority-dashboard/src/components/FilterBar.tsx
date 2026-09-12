import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface Props {
  category: string;
  setCategory: (val: string) => void;
  minSeverity: number;
  setMinSeverity: (val: number) => void;
  escalationRisk: string;
  setEscalationRisk: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  onReset: () => void;
  showResolved: boolean;
  setShowResolved: (value: boolean) => void;
}

export const FilterBar: React.FC<Props> = ({
  category,
  setCategory,
  minSeverity,
  setMinSeverity,
  escalationRisk,
  setEscalationRisk,
  status,
  setStatus, onReset, showResolved, setShowResolved
}) => {
  return (
    <div className="glass-card" style={{
      margin: '0 20px 16px 20px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06B6D4' }}>
        <SlidersHorizontal size={18} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Matrix</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={onReset} style={{ background: 'transparent', border: '1px solid rgba(6,182,212,.45)', color: '#67E8F9', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '.75rem' }}>Show all</button>
        <label style={{ color: '#CBD5E1', fontSize: '.76rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} style={{ accentColor: '#10B981' }} /> Show resolved history</label>
        {/* Category Dropdown */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Categories</option>
            <option value="drainage_blockage">Drainage Overflow</option>
            <option value="pothole">Pothole Hazard</option>
            <option value="garbage">Garbage Waste</option>
            <option value="water_leak">Water Leakage</option>
            <option value="power_outage">Power Outage</option>
            <option value="streetlight">Streetlight</option>
          </select>
        </div>

        {/* Escalation Risk */}
        <div>
          <select
            value={escalationRisk}
            onChange={(e) => setEscalationRisk(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Severity Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Min Severity: <strong>{minSeverity}</strong></span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minSeverity}
            onChange={(e) => setMinSeverity(Number(e.target.value))}
            style={{ accentColor: '#06B6D4', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};
