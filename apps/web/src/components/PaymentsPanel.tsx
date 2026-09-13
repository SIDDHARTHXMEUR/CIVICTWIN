import { useStore } from '../store';
import { ExternalLink, CheckCircle2, Clock, XCircle, Banknote } from 'lucide-react';

export default function PaymentsPanel() {
  const payments = useStore(state => state.payments);
  const isDark = useStore(state => state.theme) === 'dark';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: isDark ? 'rgba(18, 20, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      color: isDark ? '#f3f4f6' : '#0a0a0a',
      fontFamily: '"Hanken Grotesk", sans-serif',
      padding: '24px',
      overflowY: 'auto'
    }}>
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px',
          backgroundColor: '#4fc9dc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000'
        }}>
          <Banknote size={16} strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em' }}>x402 PAYMENT LEDGER</h2>
          <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', fontFamily: '"JetBrains Mono", monospace' }}>
            ALGORAND TESTNET SETTLEMENTS
          </div>
        </div>
      </header>

      {payments.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: isDark ? '#6b7280' : '#9ca3af',
          textAlign: 'center', gap: '12px'
        }}>
          <Banknote size={48} strokeWidth={1} opacity={0.5} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>No payments settled yet</div>
            <div style={{ fontSize: '12px' }}>Transactions will appear here once processed.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 2fr 100px 100px 140px 100px',
            gap: '12px',
            padding: '8px 16px',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", monospace',
            color: isDark ? '#9ca3af' : '#6b7280',
            borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
            letterSpacing: '0.05em'
          }}>
            <div>TIMESTAMP</div>
            <div>RESOURCE</div>
            <div style={{ textAlign: 'right' }}>AMOUNT</div>
            <div>PAYER</div>
            <div>TX HASH</div>
            <div>STATUS</div>
          </div>

          {/* Ledger Rows */}
          {payments.map((payment, idx) => (
            <div 
              key={payment.id} 
              className={`beveled-3d-frame row-interactive fade-slide-in stagger-${(idx % 6) + 1}`} 
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 2fr 100px 100px 140px 100px',
                gap: '12px',
                padding: '12px 16px',
                alignItems: 'center',
                backgroundColor: isDark ? '#1c202c' : '#ffffff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: isDark ? '#9ca3af' : '#6b7280' }}>
                {new Date(payment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
              
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={payment.resource_path}>
                {payment.resource_path === '/reports/predictive' ? 'AI Predictive Failure Report' : payment.resource_path}
              </div>

              <div style={{ textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: '#4fc9dc', fontWeight: 600 }}>
                {payment.amount.toFixed(2)} USDC
              </div>

              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', display: 'flex', justifyContent: 'center' }}>
                {payment.payer_algorand_address.length > 10 ? 
                  `${payment.payer_algorand_address.substring(0, 4)}...${payment.payer_algorand_address.substring(payment.payer_algorand_address.length - 4)}` 
                  : payment.payer_algorand_address}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <a 
                  href={`https://lora.algokit.io/testnet/transaction/${payment.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tactile"
                  style={{
                    color: '#00a5e3',
                    textDecoration: 'none',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px',
                    borderRadius: '2px',
                  }}
                >
                  {payment.tx_hash.substring(0, 12)}...
                  <ExternalLink size={10} />
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {payment.status === 'settled' && (
                  <CheckCircle2 size={14} color="#10b981" style={{ filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.5))' }} />
                )}
                {payment.status === 'pending' && (
                  <Clock size={14} color="#f59e0b" style={{ animation: 'rhythmicPulse 1.5s ease-in-out infinite' }} />
                )}
                {payment.status === 'failed' && <XCircle size={14} color="#ef4444" />}
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  fontFamily: '"JetBrains Mono", monospace', 
                  color: payment.status === 'settled' ? '#10b981' : payment.status === 'pending' ? '#f59e0b' : '#ef4444'
                }}>
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
