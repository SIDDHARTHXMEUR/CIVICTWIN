import React from 'react';
import type { Incident } from '../store';

interface PredictiveReportData {
  failureProbability: number;    // 0-100
  horizonHours: number;          // prediction window
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  contributingFactors: { factor: string; weight: number; value: string }[];
  affectedPopulation: number;
  infrastructureAtRisk: string[];
  escalationCurve: { hours: number; probability: number }[];
  recommendedWindow: string;
  simulationNote: string;
}

function generateReport(incident: Incident): PredictiveReportData {
  // Deterministic simulation — clearly labeled as SIMULATED DATA
  const baseProbability = Math.min(95, 55 + (incident.severity || 7) * 4);
  const impactPct = incident.impactPct || 70;
  
  const riskLevel: PredictiveReportData['riskLevel'] =
    baseProbability >= 80 ? 'CRITICAL' :
    baseProbability >= 60 ? 'HIGH' :
    baseProbability >= 40 ? 'MODERATE' : 'LOW';

  return {
    failureProbability: baseProbability,
    horizonHours: 6,
    riskLevel,
    contributingFactors: [
      { factor: 'Sensor Anomaly Score', weight: 25, value: `${(incident.severity || 7) * 10}% above threshold` },
      { factor: 'Infrastructure Age', weight: 20, value: '12.4 years (above median 8y)' },
      { factor: 'Historical Frequency', weight: 15, value: '3 prior incidents in 30 days' },
      { factor: 'Report Corroboration', weight: 15, value: `${incident.reportCount || 1} confirmed reports` },
      { factor: 'Population Exposure', weight: 15, value: `${Math.round(impactPct * 18.4).toLocaleString()} residents` },
      { factor: 'Environmental Stress', weight: 10, value: 'Monsoon season +2.1× load factor' },
    ],
    affectedPopulation: Math.round(impactPct * 18.4),
    infrastructureAtRisk: [
      'Mansarovar Water Grid 7 — Primary feeder line',
      'MI Road Junction Box — 14kV transformer',
      'Vaishali Nagar Sewage Line 3B',
    ],
    escalationCurve: [
      { hours: 1, probability: baseProbability * 0.6 },
      { hours: 3, probability: baseProbability * 0.78 },
      { hours: 6, probability: baseProbability },
      { hours: 12, probability: Math.min(98, baseProbability * 1.1) },
      { hours: 24, probability: Math.min(99, baseProbability * 1.18) },
    ],
    recommendedWindow: baseProbability > 75 ? '< 2 hours (Emergency)' : '< 6 hours (Priority)',
    simulationNote: 'SIMULATED PREDICTION — Based on synthetic sensor data and historical Jaipur incident patterns. Not derived from live sensor feeds. Confidence ±12%.',
  };
}

interface PredictiveFailureReportProps {
  incident: Incident;
  txHash: string;
  isDark: boolean;
}

export const PredictiveFailureReport: React.FC<PredictiveFailureReportProps> = ({ incident, txHash, isDark }) => {
  const report = generateReport(incident);
  
  const bg = isDark ? '#0d1117' : '#f8f9fa';
  const border = isDark ? '#2a2f3d' : '#dee2e6';
  const text = isDark ? '#e6edf3' : '#0a0a0a';
  const subtle = isDark ? '#8b949e' : '#6b7280';
  const mono = '"JetBrains Mono", monospace';

  const riskColors: Record<string, string> = {
    CRITICAL: '#ef4444', HIGH: '#f59e0b', MODERATE: '#3b82f6', LOW: '#10b981'
  };
  const riskColor = riskColors[report.riskLevel];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '10px', fontFamily: mono }}>
      {/* Verified payment badge */}
      <div style={{
        padding: '5px 8px',
        backgroundColor: '#ecfdf5',
        border: '1px solid #10b981',
        color: '#065f46',
        fontSize: '9px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>✓</span>
        <span>PREMIUM UNLOCKED — TX: </span>
        <a
          href={`https://lora.algokit.io/testnet/transaction/${txHash}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#065f46', textDecoration: 'underline', fontWeight: 700 }}
        >
          {txHash.slice(0, 16)}...
        </a>
        <span style={{ marginLeft: 'auto', color: '#6b7280' }}>ALGORAND TESTNET</span>
      </div>

      {/* Main risk score */}
      <div style={{
        backgroundColor: bg,
        border: `2px solid ${riskColor}`,
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 800, color: riskColor, letterSpacing: '0.08em' }}>
            FAILURE PROBABILITY / {report.horizonHours}H
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: riskColor, lineHeight: 1 }}>
            {report.failureProbability}%
          </div>
          <div style={{ fontSize: '9px', color: subtle }}>
            RISK LEVEL: <span style={{ color: riskColor, fontWeight: 800 }}>{report.riskLevel}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', color: subtle }}>RESPONSE WINDOW</div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: text }}>{report.recommendedWindow}</div>
          <div style={{ fontSize: '9px', color: subtle, marginTop: '4px' }}>AFFECTED POP.</div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b' }}>
            {report.affectedPopulation.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Contributing factors */}
      <div style={{ border: `1px solid ${border}`, padding: '8px', backgroundColor: bg }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: riskColor, letterSpacing: '0.08em', marginBottom: '6px' }}>
          CONTRIBUTING FACTORS
        </div>
        {report.contributingFactors.map((f) => (
          <div key={f.factor} style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: subtle, fontSize: '9px' }}>{f.factor}</span>
              <span style={{ color: text, fontWeight: 700, fontSize: '9px' }}>{f.weight}%</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '3px', backgroundColor: isDark ? '#2a2f3d' : '#e5e7eb' }}>
              <div style={{ height: '100%', width: `${f.weight * 4}%`, backgroundColor: riskColor }} />
            </div>
            <div style={{ color: subtle, fontSize: '8px', marginTop: '1px' }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* Escalation curve */}
      <div style={{ border: `1px solid ${border}`, padding: '8px', backgroundColor: bg }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: subtle, letterSpacing: '0.08em', marginBottom: '6px' }}>
          ESCALATION PROBABILITY CURVE
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
          {report.escalationCurve.map((point) => (
            <div key={point.hours} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{
                width: '100%',
                height: `${(point.probability / 100) * 36}px`,
                backgroundColor: point.probability > 75 ? riskColor : '#3b82f6',
                opacity: 0.8,
              }} />
              <span style={{ fontSize: '7px', color: subtle }}>{point.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure at risk */}
      <div style={{ border: `1px solid ${border}`, padding: '8px', backgroundColor: bg }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: subtle, letterSpacing: '0.08em', marginBottom: '4px' }}>
          INFRASTRUCTURE AT RISK
        </div>
        {report.infrastructureAtRisk.map((item, i) => (
          <div key={i} style={{ fontSize: '9px', color: text, padding: '2px 0', borderBottom: i < 2 ? `1px solid ${border}` : 'none' }}>
            ⚠ {item}
          </div>
        ))}
      </div>

      {/* Simulation disclaimer */}
      <div style={{
        fontSize: '8px',
        color: '#f59e0b',
        backgroundColor: isDark ? '#1c1a0a' : '#fffbeb',
        border: '1px solid #f59e0b',
        padding: '5px 8px',
        lineHeight: 1.5,
      }}>
        ⚠ {report.simulationNote}
      </div>
    </div>
  );
};
