import { useStore } from '../store';
import type { KpiMetric } from '../store';

export default function KpiStrip() {
  const kpis = useStore(state => state.kpis);
  const theme = useStore(state => state.theme);
  const isDark = theme === 'dark';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '8px',
      padding: '4px',
      flexShrink: 0,
    }}>
      {kpis.map((kpi, idx) => (
        <KpiCard key={kpi.id} kpi={kpi} isLast={idx === kpis.length - 1} hasBorderLeft={idx > 0} isDark={isDark} />
      ))}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '28px', width: '56px' }}>
      {data.map((val, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(val / max) * 100}%`,
          backgroundColor: color,
          opacity: 0.7 + (i / data.length) * 0.3,
          minHeight: '2px',
          borderRadius: '0px',
        }} />
      ))}
    </div>
  );
}

function KpiCard({ kpi, isDark }: { kpi: KpiMetric, hasBorderLeft: boolean, isLast: boolean, isDark: boolean }) {
  const isAlert = kpi.status === 'alert';
  const isWarning = kpi.status === 'warning';
  const isGood = kpi.status === 'good';

  const valueColor = isAlert ? '#ea3b1b' : isDark ? '#f3f4f6' : '#0a0a0a';
  const sparkColor = isAlert ? '#ea3b1b' : isWarning ? '#f59e0b' : isDark ? '#4fc9dc' : '#0a0a0a';
  const trendColor = kpi.deltaPct > 0 ? '#10b981' : '#ea3b1b';

  let badge = null;
  if (isGood && kpi.id === 'air-quality') {
    badge = <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', backgroundColor: '#0891b2', padding: '1px 5px', letterSpacing: '0.05em', borderRadius: '0px', fontFamily: '"JetBrains Mono", monospace' }}>GOOD</span>;
  } else if (isAlert || isWarning) {
    badge = <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', backgroundColor: '#ea3b1b', padding: '1px 5px', letterSpacing: '0.05em', borderRadius: '0px', fontFamily: '"JetBrains Mono", monospace' }}>ALERT</span>;
  }

  const suffix = kpi.id === 'city-health' ? <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '2px', fontFamily: '"JetBrains Mono", monospace' }}>/100</span> : null;
  const unit = kpi.id === 'mobility-flow' ? '%' : '';

  return (
    <div className="beveled-3d-frame" style={{
      padding: '12px 16px',
      backgroundColor: isDark ? '#161922' : '#f5f2e8',
      fontFamily: '"Hanken Grotesk", sans-serif',
      borderRadius: '0px',
    }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#9ca3af' : '#6b7280', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
          {kpi.label.toUpperCase()}
        </span>
        <span style={{ fontSize: '10px', color: trendColor, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
          {kpi.deltaPct > 0 ? '+' : ''}{kpi.deltaPct}% / {kpi.deltaWindow}
        </span>
      </div>

      {/* Value row with extreme type scale jump */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: valueColor, fontFamily: '"Hanken Grotesk", sans-serif', letterSpacing: '-0.03em' }}>
            {Math.round(kpi.value)}{unit}
          </span>
          {suffix}
          {badge && <div style={{ marginBottom: '4px' }}>{badge}</div>}
        </div>
        <Sparkline data={kpi.history} color={sparkColor} />
      </div>
    </div>
  );
}
