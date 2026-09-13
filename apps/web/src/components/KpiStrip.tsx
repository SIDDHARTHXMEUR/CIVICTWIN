import { useStore } from '../store';
import type { KpiMetric } from '../store';
import { TelemetrySparkline } from './TelemetrySparkline';
import { useAnimatedNumber } from '../lib/useAnimatedNumber';

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
        <KpiCard key={kpi.id} kpi={kpi} index={idx} isLast={idx === kpis.length - 1} hasBorderLeft={idx > 0} isDark={isDark} />
      ))}
    </div>
  );
}

function KpiCard({ kpi, index, isDark }: { kpi: KpiMetric, index: number, hasBorderLeft: boolean, isLast: boolean, isDark: boolean }) {
  const animatedValue = useAnimatedNumber(kpi.value, 500);
  const isAlert = kpi.status === 'alert';
  const isWarning = kpi.status === 'warning';
  const isGood = kpi.status === 'good';

  const valueColor = isAlert ? '#ea3b1b' : isDark ? '#f3f4f6' : '#0a0a0a';
  const sparkColor = isAlert ? '#ea3b1b' : isWarning ? '#f59e0b' : isDark ? '#4fc9dc' : '#0a0a0a';
  const trendColor = kpi.deltaPct > 0 ? '#10b981' : kpi.deltaPct < 0 ? '#ea3b1b' : '#6b7280';
  const trendIcon = kpi.deltaPct > 0 ? '▲' : kpi.deltaPct < 0 ? '▼' : '▬';

  let badge = null;
  if (isGood && kpi.id === 'air-quality') {
    badge = <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', backgroundColor: '#0891b2', padding: '1px 5px', letterSpacing: '0.05em', borderRadius: '0px', fontFamily: '"JetBrains Mono", monospace' }}>GOOD</span>;
  } else if (isAlert || isWarning) {
    badge = (
      <span style={{ 
        fontSize: '9px', 
        fontWeight: 800, 
        color: '#fff', 
        backgroundColor: '#ea3b1b', 
        padding: '1px 5px', 
        letterSpacing: '0.05em', 
        borderRadius: '0px', 
        fontFamily: '"JetBrains Mono", monospace',
        boxShadow: isAlert ? '0 0 8px rgba(234, 59, 27, 0.6)' : 'none',
        animation: isAlert ? 'rhythmicPulse 1.8s ease-in-out infinite' : 'none'
      }}>
        ALERT
      </span>
    );
  }

  const suffix = kpi.id === 'city-health' ? <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '2px', fontFamily: '"JetBrains Mono", monospace' }}>/100</span> : null;
  const unit = kpi.id === 'mobility-flow' ? '%' : '';

  return (
    <div className={`beveled-3d-frame card-interactive fade-slide-in stagger-${index + 1}`} style={{
      padding: '12px 16px',
      backgroundColor: isDark ? '#161922' : '#f5f2e8',
      fontFamily: '"Hanken Grotesk", sans-serif',
      borderRadius: '0px',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
    }}>
      {/* Subtle top indicator bar with width/opacity transition */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: isAlert ? '#ea3b1b' : isWarning ? '#f59e0b' : '#4fc9dc',
        opacity: isAlert ? 1 : 0.6,
        transition: 'background-color 0.3s ease, opacity 0.3s ease',
      }} />

      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ position: 'relative', width: '8px', height: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pulsing ring for alert/warning */}
            {(isAlert || isWarning) && (
              <span 
                className="beacon-ring" 
                style={{ backgroundColor: isAlert ? '#ea3b1b' : '#f59e0b' }} 
              />
            )}
            <span style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: isAlert ? '#ea3b1b' : isWarning ? '#f59e0b' : '#10b981',
              borderRadius: '50%',
              display: 'inline-block',
              boxShadow: isAlert ? '0 0 6px #ea3b1b' : 'none',
              transition: 'background-color 0.3s ease'
            }} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#1e293b', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
            {kpi.label.toUpperCase()}
          </span>
        </div>
        <span style={{ 
          fontSize: '10px', 
          color: trendColor, 
          fontFamily: '"JetBrains Mono", monospace', 
          fontWeight: 700, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2px',
          transition: 'color 0.3s ease'
        }}>
          <span>{trendIcon}</span> {kpi.deltaPct > 0 ? '+' : ''}{kpi.deltaPct}% / {kpi.deltaWindow}
        </span>
      </div>

      {/* Value row with extreme type scale jump & animated number */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ 
            fontSize: '42px', 
            fontWeight: 800, 
            lineHeight: 1, 
            color: valueColor, 
            fontFamily: '"Hanken Grotesk", sans-serif', 
            letterSpacing: '-0.03em',
            transition: 'color 0.3s ease'
          }}>
            {Math.round(animatedValue)}{unit}
          </span>
          {suffix}
          {badge && <div style={{ marginBottom: '4px' }}>{badge}</div>}
        </div>
        <TelemetrySparkline data={kpi.history} color={sparkColor} isDark={isDark} width={75} height={32} />
      </div>
    </div>
  );
}

