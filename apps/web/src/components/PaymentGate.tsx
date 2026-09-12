import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Zap, Wallet, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { initiateX402Payment, checkExistingPayment, USDC_TESTNET_ASA_ID, DEMO_SIGNER_ADDRESS } from '../lib/x402';
import type { X402PaymentResult } from '../lib/x402';
import { useStore } from '../store';

// ─────────────────────────────────────────────────────────────
// Demo auto-signer — real funded testnet account.
// Address: LHEA3T2WPKAQRRFVQZ5T3QVW5HRT5YZWDWJKYDBKVB7CBCK453WT3KNVS4
// Fund it with ALGO + USDC (ASA 10458941) at:
//   https://lora.algokit.io/testnet/fund
// ─────────────────────────────────────────────────────────────

function useDemoWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    // In a full Pera Wallet flow this opens the wallet popup.
    // For the hackathon demo the account is pre-funded and auto-signs.
    await new Promise(r => setTimeout(r, 600));
    setAddress(DEMO_SIGNER_ADDRESS);
    setConnecting(false);
  };

  const disconnect = () => setAddress(null);

  return { address, connect, disconnect, connecting };
}

// ─────────────────────────────────────────────────────────────
// PaymentGate
// ─────────────────────────────────────────────────────────────
interface PaymentGateProps {
  resourceId: string;       // Unique resource identifier, e.g. "incident-INC-001"
  priceUsdc?: number;       // Price in USDC, default 0.1
  description?: string;     // What the user is paying for
  isDark?: boolean;
  children: React.ReactNode;
}

type PaymentState = 'locked' | 'connecting' | 'signing' | 'broadcasting' | 'settled' | 'error';

export const PaymentGate: React.FC<PaymentGateProps> = ({
  resourceId,
  priceUsdc = 0.1,
  description = 'AI Intelligence Report',
  isDark = false,
  children,
}) => {
  const { address, connect, disconnect, connecting } = useDemoWallet();
  const [paymentState, setPaymentState] = useState<PaymentState>('locked');
  const [result, setResult] = useState<X402PaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if this resource was already paid for on mount
  useEffect(() => {
    if (address) {
      checkExistingPayment(address, resourceId).then(txHash => {
        if (txHash) {
          setResult({
            txHash,
            status: 'settled',
            payerAddress: address,
            amount: priceUsdc,
            resourcePath: resourceId,
          });
          setPaymentState('settled');
        }
      });
    }
  }, [address, resourceId, priceUsdc]);

  const handlePay = async () => {
    if (!address) return;

    try {
      setErrorMsg(null);
      setPaymentState('signing');

      // Simulate wallet signing UI delay (real flow: Pera wallet popup)
      await new Promise(r => setTimeout(r, 1000));
      setPaymentState('broadcasting');

      // ── REAL x402 facilitator call ──────────────────────────────
      // This calls GoPlausible testnet facilitator via HTTP POST /x402/pay
      // Falls back to a demo hash if CORS/network prevents direct browser call
      const paymentResult = await initiateX402Payment({
        resourcePath: resourceId,
        amountUsdc: priceUsdc,
        payerAddress: address,
        description,
      });
      // ────────────────────────────────────────────────────────────

      setResult(paymentResult);
      setPaymentState('settled');

      // Optimistic update: push settled payment into Zustand store immediately
      // so IntelligencePanel's isPaid check unlocks Dispatch Resolution instantly
      useStore.getState().addPayment({
        id: `local-${Date.now()}`,
        payer_algorand_address: address,
        tx_hash: paymentResult.txHash,
        resource_path: resourceId,
        amount: priceUsdc,
        asset_id: `ASA:${USDC_TESTNET_ASA_ID}`,
        status: 'settled',
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setPaymentState('error');
      setErrorMsg(err.message || 'Payment failed. Please retry.');
    }
  };

  const mono = '"JetBrains Mono", monospace';
  const cardBg = isDark ? '#0d1117' : '#f8f9fa';
  const cardBorder = isDark ? '#30363d' : '#dee2e6';
  const textPrimary = isDark ? '#e6edf3' : '#0a0a0a';
  const textMuted = isDark ? '#8b949e' : '#6b7280';

  // ── SETTLED: Show unlocked content ──
  if (paymentState === 'settled' && result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          padding: '6px 10px',
          backgroundColor: isDark ? '#0d2318' : '#ecfdf5',
          border: '1px solid #10b981',
          color: '#10b981',
          fontSize: '9px',
          fontFamily: mono,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}>
          <Unlock size={11} />
          <span>PREMIUM UNLOCKED · x402 · ALGORAND TESTNET</span>
          <span style={{ marginLeft: 'auto', color: textMuted }}>
            {priceUsdc} USDC · ASA {USDC_TESTNET_ASA_ID}
          </span>
          <a
            href={`https://lora.algokit.io/testnet/transaction/${result.txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}
          >
            <span>{result.txHash.slice(0, 14)}...</span>
            <ExternalLink size={9} />
          </a>
        </div>
        {children}
      </div>
    );
  }

  // ── LOCKED: Show payment prompt ──
  const stateLabel: Record<PaymentState, string> = {
    locked:      `PAY ${priceUsdc} USDC TO UNLOCK`,
    connecting:  'CONNECTING WALLET...',
    signing:     'WAITING FOR SIGNATURE...',
    broadcasting:'BROADCASTING TO ALGORAND...',
    settled:     'PAYMENT SETTLED',
    error:       'RETRY PAYMENT',
  };
  const isProcessing = ['connecting', 'signing', 'broadcasting'].includes(paymentState);

  return (
    <div style={{
      backgroundColor: cardBg,
      border: `1px solid ${paymentState === 'error' ? '#ef4444' : isDark ? '#30363d' : '#e5e7eb'}`,
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
      fontFamily: mono,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header Band */}
      <div style={{
        backgroundColor: paymentState === 'error' ? '#ef4444' : '#0a0a0a',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ffffff',
        borderBottom: `2px solid ${paymentState === 'error' ? '#dc2626' : '#ea3b1b'}`
      }}>
        {paymentState === 'error' ? <AlertTriangle size={14} /> : <Lock size={14} />}
        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', fontFamily: '"Space Grotesk", sans-serif' }}>
          {description.toUpperCase()}
        </span>
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Narrative Subtitle */}
        <div style={{ fontSize: '10px', color: textPrimary, lineHeight: 1.4, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500 }}>
          Premium municipal intelligence — billed per report via your department's Algorand treasury account.
        </div>

        {/* Pricing Pill */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 10px',
            backgroundColor: isDark ? '#161b22' : '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '0px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6' }}>{priceUsdc} USDC</span>
            <span style={{ fontSize: '9px', color: textMuted }}>= {(priceUsdc * 1_000_000).toLocaleString()} µUSDC</span>
          </div>
        </div>

        {/* Error message */}
        {paymentState === 'error' && errorMsg && (
          <div style={{
            fontSize: '10px', color: '#ffffff', backgroundColor: '#ef4444',
            padding: '6px 10px', width: '100%', boxSizing: 'border-box',
            fontWeight: 700
          }}>
            ✕ {errorMsg}
          </div>
        )}

      {/* Wallet / Pay button */}
      {!address ? (
        <button
          onClick={connect}
          disabled={connecting}
          style={{
            padding: '10px 16px',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: mono,
            backgroundColor: connecting ? '#374151' : '#ea3b1b',
            color: '#ffffff',
            border: 'none',
            cursor: connecting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            letterSpacing: '0.05em',
            width: '100%',
            transition: 'background-color 0.2s',
          }}
        >
          <Wallet size={14} />
          {connecting ? 'CONNECTING...' : 'AUTHORIZE MUNICIPAL PAYMENT'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
          {/* Wallet badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '8px', color: '#10b981', backgroundColor: isDark ? '#0d2318' : '#ecfdf5',
            padding: '2px 8px', border: '1px solid #10b981',
          }}>
            <CheckCircle size={9} />
            <span style={{ fontWeight: 700 }}>Jaipur Water Dept.</span>
            <span style={{ opacity: 0.7 }}>({address.slice(0, 8)}...)</span>
            <button
              onClick={disconnect}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '9px', padding: '0 2px' }}
            >
              ✕
            </button>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            style={{
              padding: '8px 20px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: mono,
              backgroundColor: isProcessing ? '#374151' : paymentState === 'error' ? '#dc2626' : '#f59e0b',
              color: isProcessing ? '#9ca3af' : '#0a0a0a',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.06em',
              animation: isProcessing ? 'rhythmicPulse 1.5s infinite' : 'none',
            }}
          >
            <Zap size={13} />
            {stateLabel[paymentState]}
          </button>

          {/* Processing status indicator */}
          {isProcessing && (
            <div style={{ fontSize: '8px', color: '#f59e0b', letterSpacing: '0.04em' }}>
              {paymentState === 'signing' && '📱 SIGN IN PERA WALLET...'}
              {paymentState === 'broadcasting' && '📡 SUBMITTING TO ALGORAND TESTNET...'}
            </div>
          )}
        </div>
      )}

      {/* Protocol info */}
      <div style={{
        fontSize: '8px', color: textMuted, borderTop: `1px solid ${cardBorder}`,
        padding: '10px 14px', width: '100%', textAlign: 'left', lineHeight: 1.6,
        backgroundColor: isDark ? '#161922' : '#f5f2e8',
        boxSizing: 'border-box'
      }}>
        x402 Payment Protocol · GoPlausible Facilitator · Algorand Testnet<br />
        USDC (ASA {USDC_TESTNET_ASA_ID}) · Settled on-chain · Logged to CivicTwin DB
      </div>
      </div>
    </div>
  );
};
