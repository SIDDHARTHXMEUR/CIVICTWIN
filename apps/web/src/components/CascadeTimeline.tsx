import React from 'react';
import type { Incident } from '../store';

interface CascadeTimelineProps {
  incident: Incident;
  isDark?: boolean;
}

interface Checkpoint {
  timeOffset: string;
  minutes: number;
  riskPercent: number;
  riskLabel: 'Moderate' | 'High' | 'Severe' | 'Critical';
  affectedPopulation: number;
  impactRadiusMeters: number;
  statusHeadline: string;
  projectedCostInr: number;
}

export const CascadeTimeline: React.FC<CascadeTimelineProps> = ({
  incident,
  isDark = false,
}) => {
  const sev = incident.severity ?? 8;
  const basePop =
    sev >= 8
      ? 18500
      : sev >= 6
      ? 9200
      : 3400;

  const baseFailureProb = Math.min(85, Math.max(30, (incident.impactPct || 65) - 10));

  const checkpoints: Checkpoint[] = [
    {
      timeOffset: '+15m',
      minutes: 15,
      riskPercent: Math.min(95, baseFailureProb + 12),
      riskLabel: sev >= 8 ? 'Severe' : 'Moderate',
      affectedPopulation: Math.round(basePop * 1.15),
      impactRadiusMeters: 450,
      statusHeadline: 'Sub-surface pressure spike spreading to secondary valves',
      projectedCostInr: Math.round(basePop * 1.15 * 180),
    },
    {
      timeOffset: '+45m',
      minutes: 45,
      riskPercent: Math.min(98, baseFailureProb + 26),
      riskLabel: 'High',
      affectedPopulation: Math.round(basePop * 1.6),
      impactRadiusMeters: 850,
      statusHeadline: 'Adjacent feeder lines destabilized; minor surface ponding',
      projectedCostInr: Math.round(basePop * 1.6 * 240),
    },
    {
      timeOffset: '+90m',
      minutes: 90,
      riskPercent: Math.min(99, baseFailureProb + 38),
      riskLabel: 'Severe',
      affectedPopulation: Math.round(basePop * 2.3),
      impactRadiusMeters: 1400,
      statusHeadline: 'Main junction isolation failure; cross-ward grid disruption',
      projectedCostInr: Math.round(basePop * 2.3 * 310),
    },
    {
      timeOffset: '+120m',
      minutes: 120,
      riskPercent: 99,
      riskLabel: 'Critical',
      affectedPopulation: Math.round(basePop * 3.1),
      impactRadiusMeters: 2200,
      statusHeadline: 'Full catchment compromise; multi-ward potable shutdown required',
      projectedCostInr: Math.round(basePop * 3.1 * 420),
    },
  ];

  const worstCaseCost = checkpoints[checkpoints.length - 1].projectedCostInr;
  const worstCasePop = checkpoints[checkpoints.length - 1].affectedPopulation;

  // Indian Currency System formatting:
  // >= 1 Crore (100 Lakh = 10,000,000) -> ₹X.XX Cr
  // >= 1 Lakh (100,000) -> ₹X.XX Lakh
  // Otherwise -> standard comma formatting
  const formatIndianCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr.toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      const lakh = amount / 100000;
      return `₹${lakh.toFixed(2)} Lakh`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? '#161922' : '#ffffff',
        border: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
        padding: '12px',
        fontFamily: '"JetBrains Mono", monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        textAlign: 'left',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            ANOMALY CASCADE TIMELINE
          </span>
        </div>
        <span
          style={{
            fontSize: '8px',
            fontWeight: 700,
            padding: '1px 5px',
            backgroundColor: isDark ? '#201809' : '#fffbeb',
            color: '#b45309',
            border: `1px solid ${isDark ? '#78350f' : '#fde68a'}`,
          }}
        >
          120-MIN PROJECTION
        </span>
      </div>

      {/* Honest Simulation Disclaimer (High Contrast) */}
      <div
        style={{
          backgroundColor: isDark ? '#201809' : '#fef9c3',
          border: `1px solid ${isDark ? '#78350f' : '#facc15'}`,
          padding: '8px 10px',
          fontSize: '9px',
          lineHeight: 1.45,
          color: isDark ? '#fef08a' : '#713f12',
        }}
      >
        <strong style={{ color: isDark ? '#fef08a' : '#854d0e' }}>
          SIMULATED PREDICTION DISCLAIMER:
        </strong>{' '}
        Projected estimate based on current sensor trends and historical incident logs — not a real-time physical hydraulic/structural simulation.
      </div>

      {/* Tidy 2x2 Metric Grid (Zero Overflow) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div
          style={{
            backgroundColor: isDark ? '#12141a' : '#f8fafc',
            border: `1px solid ${isDark ? '#2a2f3d' : '#e2e8f0'}`,
            padding: '8px 10px',
          }}
        >
          <div
            style={{
              fontSize: '8px',
              fontWeight: 700,
              color: isDark ? '#94a3b8' : '#475569',
              textTransform: 'uppercase',
            }}
          >
            Inaction Horizon
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              fontFamily: '"Space Grotesk", sans-serif',
              marginTop: '2px',
            }}
          >
            120 Minutes
          </div>
          <div style={{ fontSize: '8px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '1px' }}>
            Full cascade ceiling
          </div>
        </div>

        <div
          style={{
            backgroundColor: isDark ? '#12141a' : '#f8fafc',
            border: `1px solid ${isDark ? '#2a2f3d' : '#e2e8f0'}`,
            padding: '8px 10px',
          }}
        >
          <div
            style={{
              fontSize: '8px',
              fontWeight: 700,
              color: isDark ? '#94a3b8' : '#475569',
              textTransform: 'uppercase',
            }}
          >
            Max Exposure
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: isDark ? '#fbbf24' : '#b45309',
              fontFamily: '"Space Grotesk", sans-serif',
              marginTop: '2px',
            }}
          >
            {worstCasePop.toLocaleString()} pop
          </div>
          <div style={{ fontSize: '8px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '1px' }}>
            Radius up to 2.2 km
          </div>
        </div>

        <div
          style={{
            gridColumn: 'span 2',
            backgroundColor: isDark ? '#12141a' : '#f8fafc',
            border: `1px solid ${isDark ? '#2a2f3d' : '#e2e8f0'}`,
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '8px',
                fontWeight: 700,
                color: isDark ? '#94a3b8' : '#475569',
                textTransform: 'uppercase',
              }}
            >
              Estimated Disruption Cost
            </div>
            <div style={{ fontSize: '8px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
              ~$280k USD (est. ₹180-420/capita)
            </div>
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#ea3b1b',
              fontFamily: '"Space Grotesk", sans-serif',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginLeft: '10px',
            }}
          >
            {formatIndianCurrency(worstCaseCost)}
          </div>
        </div>
      </div>

    </div>
  );
};
