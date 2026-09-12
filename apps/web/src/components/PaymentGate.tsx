import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Unlock, Lock, Zap } from 'lucide-react';

// Simulated wallet state for hackathon demo
// When real Pera/Defly wallet is needed, replace this with @txnlab/use-wallet-react
const useMockWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const connect = () => setAddress('JAIPUR_DEMO_' + Math.random().toString(36).substring(2, 10).toUpperCase());
  const disconnect = () => setAddress(null);
  return { address, connect, disconnect };
};

export const PaymentGate: React.FC<{
  resourceId: string;
  priceAmount: string; // e.g. '100000' = 0.1 USDC
  children: React.ReactNode;
}> = ({ resourceId, priceAmount, children }) => {
  const { address, connect } = useMockWallet();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePay = async () => {
    if (!address) {
      alert('Please connect a wallet first.');
      return;
    }
    setLoading(true);
    try {
      // Simulate on-chain x402 payment (mock for hackathon)
      await new Promise(r => setTimeout(r, 1200)); // simulate signing delay
      const mockTxHash = 'TX' + Math.random().toString(36).substring(2, 12).toUpperCase();

      // Record payment in Supabase
      await supabase.from('x402_payments').insert([{
        payer_algorand_address: address,
        tx_hash: mockTxHash,
        resource_path: resourceId,
        amount: parseFloat(priceAmount) / 1_000_000,
        asset_id: 'USDC-TESTNET',
        status: 'settled',
      }]);

      setTxHash(mockTxHash);
      setUnlocked(true);
    } catch (err: any) {
      console.error(err);
      alert('Payment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          padding: '6px 8px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Unlock size={11} />
          PREMIUM UNLOCKED —{' '}
          <a
            href={`https://lora.algokit.io/testnet/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline', color: '#065f46' }}
          >
            {txHash?.slice(0, 12)}...
          </a>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#1a1f2e',
      border: '1px solid #2a3550',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <Lock size={18} color="#60a5fa" />
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace' }}>
        AI INTELLIGENCE REPORT LOCKED
      </span>
      <span style={{ fontSize: '10px', color: '#94a3b8' }}>
        Unlock premium action via Algorand x402 · 0.1 USDC
      </span>

      {!address ? (
        <button
          onClick={connect}
          style={{
            padding: '5px 12px',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", monospace',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Zap size={11} /> CONNECT PERA WALLET
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', color: '#60a5fa', fontFamily: '"JetBrains Mono", monospace' }}>
            ✓ {address.slice(0, 18)}...
          </span>
          <button
            onClick={handlePay}
            disabled={loading}
            style={{
              padding: '6px 14px',
              backgroundColor: loading ? '#475569' : '#f59e0b',
              color: '#0a0a0a',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {loading ? '⏳ SIGNING TX...' : '⚡ PAY 0.1 USDC TO UNLOCK'}
          </button>
        </div>
      )}
    </div>
  );
};
