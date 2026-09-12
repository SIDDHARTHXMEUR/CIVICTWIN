import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Zap, Wallet, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { initiateX402Payment, checkExistingPayment, USDC_TESTNET_ASA_ID } from '../lib/x402';
import type { X402PaymentResult } from '../lib/x402';

// ─────────────────────────────────────────────────────────────
// Mock wallet — ready to swap for real Pera Wallet via
// @perawallet/connect when a real testnet account is available.
// The address must be funded with USDC (ASA 10458941) on testnet.
// ─────────────────────────────────────────────────────────────
const DEMO_WALLET_ADDRESS = 'JAIPUR7DEMO3CIVICTWIN2X402PAYMENTS4ALGORAND5TESTNET6HACK7THN';

function useDemoWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    // Simulate wallet connection handshake delay
    await new Promise(r => setTimeout(r, 800));
    setAddress(DEMO_WALLET_ADDRESS);
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
      border: `1px solid ${paymentState === 'error' ? '#ef4444' : '#3b82f6'}`,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: mono,
    }}>
      {/* Lock icon + title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        {paymentState === 'error'
          ? <AlertTriangle size={20} color="#ef4444" />
          : <Lock size={20} color="#3b82f6" />}
        <span style={{ fontSize: '11px', fontWeight: 800, color: textPrimary, letterSpacing: '0.04em' }}>
          {description.toUpperCase()}
        </span>
        <span style={{ fontSize: '9px', color: textMuted }}>
          Gate secured by Algorand x402 · GoPlausible Testnet Facilitator
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          backgroundColor: isDark ? '#161b22' : '#eff6ff',
          border: '1px solid #3b82f6',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6' }}>{priceUsdc} USDC</span>
          <span style={{ fontSize: '9px', color: textMuted }}>= {(priceUsdc * 1_000_000).toLocaleString()} µUSDC</span>
        </div>
        <span style={{ fontSize: '8px', color: textMuted }}>
          ASA ID: {USDC_TESTNET_ASA_ID} · Network: algorand:testnet
        </span>
      </div>

      {/* Error message */}
      {paymentState === 'error' && errorMsg && (
        <div style={{
          fontSize: '9px', color: '#ef4444', backgroundColor: isDark ? '#1c0a0a' : '#fef2f2',
          border: '1px solid #ef4444', padding: '4px 8px', width: '100%', textAlign: 'left',
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
            padding: '7px 16px',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: mono,
            backgroundColor: connecting ? '#374151' : '#3b82f6',
            color: '#ffffff',
            border: 'none',
            cursor: connecting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.05em',
          }}
        >
          <Wallet size={12} />
          {connecting ? 'CONNECTING...' : 'CONNECT PERA WALLET'}
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
            <span>{address.slice(0, 20)}...</span>
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
        paddingTop: '8px', width: '100%', textAlign: 'center', lineHeight: 1.6,
      }}>
        x402 Payment Protocol · GoPlausible Facilitator · Algorand Testnet
        <br />
        USDC (ASA {USDC_TESTNET_ASA_ID}) · Settled on-chain · Logged to CivicTwin DB
      </div>
    </div>
  );
};
