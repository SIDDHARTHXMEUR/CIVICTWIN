import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Unlock, Lock } from 'lucide-react';
import { USDC_TESTNET_ASA_ID } from '@x402-avm/avm';

// MOCK useWallet for Hackathon due to peer dependency issues
const useWallet = () => {
  const [active, setActive] = useState(false);
  return {
    providers: [
      { metadata: { id: 'pera', name: 'Pera Wallet' }, connect: () => setActive(true) },
      { metadata: { id: 'defly', name: 'Defly Wallet' }, connect: () => setActive(true) }
    ],
    activeAccount: active ? { address: 'TESTNET_MOCK_ADDRESS' } : null
  };
};

export const PaymentGate: React.FC<{
  resourceId: string;
  priceAmount: string; // e.g., '100000' for 0.1 USDC
  children: React.ReactNode;
}> = ({ resourceId, priceAmount, children }) => {
  const { providers, activeAccount } = useWallet();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePay = async () => {
    if (!activeAccount) {
      alert("Please connect a wallet first.");
      return;
    }

    setLoading(true);
    try {
      const receiverAddr = import.meta.env.VITE_AVM_RECEIVER_ADDRESS;
      
      if (!receiverAddr) {
        throw new Error("Missing receiver address config");
      }

      // 1. Trigger x402 payment flow using the core client
      // Create transaction via provider
      // In a full implementation, we'd use the paymentClient and facilitator to get a challenge and sign it.
      // Since @x402-avm/core might require specific adapter wiring, for this hackathon we simulate the x402
      // core interaction or use a mock tx generation if the actual provider signing is too complex to wire inline.
      // Assuming we get a transaction hash from the provider signing:
      
      const mockTxHash = "TX_" + Math.random().toString(36).substring(7); // Replace with real signTxn output
      
      // 2. Write to Supabase x402_payments
      const { error } = await supabase.from('x402_payments').insert([{
        payer_algorand_address: activeAccount.address,
        tx_hash: mockTxHash,
        resource_path: resourceId,
        amount: parseFloat(priceAmount) / 1000000, // Normalized
        asset_id: USDC_TESTNET_ASA_ID,
        status: 'settled',
      }]);

      if (error) throw error;

      setTxHash(mockTxHash);
      setUnlocked(true);
    } catch (err: any) {
      console.error(err);
      alert("Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '6px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', fontSize: '10px', fontFamily: '"JetBrains Mono", monospace' }}>
          <Unlock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          PREMIUM UNLOCKED. TX: <a href={`https://lora.algokit.io/testnet/transaction/${txHash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{txHash}</a>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <Lock size={20} color="#6b7280" />
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>
        Premium Intelligence Report Locked
      </span>
      <span style={{ fontSize: '10px', color: '#6b7280' }}>
        Unlock AI-generated simulation for 0.1 USDC via Algorand x402.
      </span>

      {!activeAccount ? (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {providers?.map((provider) => (
            <button
              key={provider.metadata.id}
              onClick={provider.connect}
              style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer', backgroundColor: '#e5e7eb', border: '1px solid #9ca3af' }}
            >
              Connect {provider.metadata.name}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            fontSize: '11px',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"JetBrains Mono", monospace'
          }}
        >
          {loading ? 'PROCESSING...' : `PAY 0.1 USDC TO UNLOCK`}
        </button>
      )}
    </div>
  );
};
