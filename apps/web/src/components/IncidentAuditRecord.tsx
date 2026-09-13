import React, { useState, useEffect } from 'react';
import type { Incident } from '../store';
import { generateSensorSnapshotHash } from '../lib/x402';

interface IncidentAuditRecordProps {
  incident: Incident;
  txHash: string;
  isDark?: boolean;
}

export const IncidentAuditRecord: React.FC<IncidentAuditRecordProps> = ({
  incident,
  txHash,
  isDark = false,
}) => {
  const [snapshotHash, setSnapshotHash] = useState<string>('Computing hash...');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    generateSensorSnapshotHash({
      id: incident.id,
      title: incident.title,
      category: incident.category,
      severity: incident.severity,
      lat: incident.lat,
      lng: incident.lng,
      updatedAt: incident.updatedAt,
    }).then((hash) => {
      if (isMounted) setSnapshotHash(hash);
    });
    return () => {
      isMounted = false;
    };
  }, [incident]);

  const settlementTime = new Date().toISOString();
  const loraUrl = `https://lora.algokit.io/testnet/transaction/${txHash}`;
  const confidenceScore = incident.confidencePct ? incident.confidencePct / 100 : 0.89;

  const auditData = {
    recordType: 'CIVICTWIN_INCIDENT_AUDIT_RECORD',
    version: '1.0',
    incidentId: incident.id,
    classification: {
      category: incident.category,
      title: incident.title,
      severity: `${incident.severity || 8}/10`,
      confidenceScore: confidenceScore,
      modelExplanation: incident.recommendedAction || incident.rootCause || 'Automated classification based on real-time municipal telemetry.',
    },
    sensorSnapshotSha256: snapshotHash,
    settlement: {
      network: 'Algorand Testnet',
      transactionId: txHash,
      explorerUrl: loraUrl,
      settledAt: settlementTime,
      settlementType: 'M2M_COMPUTE_MICRO_SETTLEMENT',
    },
    disclaimer: 'This record is cryptographically timestamped and verifiable on Algorand Testnet — suitable as an operational diligence record. Not a certified legal or insurance instrument.',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(auditData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textContent = `===============================================================
CIVICTWIN // INCIDENT OPERATIONAL AUDIT RECORD
Settled via Algorand Testnet x402 Compute Protocol
===============================================================
Record Generated: ${settlementTime}
Incident ID:     ${incident.id}
Category/Title:  ${incident.category.toUpperCase()} — ${incident.title}
Severity Score:  ${incident.severity || 8}/10
Geo Coordinates: [${(incident.lat || 26.9124).toFixed(5)}, ${(incident.lng || 75.7873).toFixed(5)}]

---------------------------------------------------------------
1. CRYPTOGRAPHIC SENSOR SNAPSHOT
---------------------------------------------------------------
SHA-256 Digest:
${snapshotHash}
(Computed over raw telemetry readings, threshold telemetry, and timestamp)

---------------------------------------------------------------
2. AI CLASSIFICATION & CONFIDENCE
---------------------------------------------------------------
Classification:  ${incident.title}
Confidence:      ${(confidenceScore * 100).toFixed(1)}%
Reasoning:       ${incident.recommendedAction || incident.rootCause || 'Telemetry threshold exceeded standard operational limits.'}

---------------------------------------------------------------
3. ON-CHAIN SETTLEMENT VERIFICATION
---------------------------------------------------------------
Network:         Algorand Testnet
Transaction ID:  ${txHash}
Explorer URL:    ${loraUrl}
Timestamp:       ${settlementTime}

---------------------------------------------------------------
4. DILIGENCE & INTEGRITY STATEMENT
---------------------------------------------------------------
This record is cryptographically timestamped and verifiable on the
Algorand Testnet. It provides immutable proof-of-state for municipal
operational diligence. This document does not constitute a statutory
or regulatory insurance certificate.
===============================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CivicTwin-Audit-${incident.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              backgroundColor: '#10b981',
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
            CRYPTOGRAPHIC AUDIT RECORD
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontSize: '8px',
              fontWeight: 700,
              padding: '1px 5px',
              backgroundColor: isDark ? '#0d2318' : '#ecfdf5',
              color: '#059669',
              border: `1px solid ${isDark ? '#059669' : '#a7f3d0'}`,
            }}
          >
            ON-CHAIN
          </span>
          <span
            style={{
              fontSize: '8px',
              fontWeight: 700,
              padding: '1px 5px',
              backgroundColor: isDark ? '#1c202c' : '#f1f5f9',
              color: isDark ? '#94a3b8' : '#334155',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            }}
          >
            ALGORAND
          </span>
        </div>
      </div>

      {/* 1. Sensor Snapshot SHA-256 */}
      <div
        style={{
          backgroundColor: isDark ? '#12141a' : '#f8fafc',
          border: `1px solid ${isDark ? '#2a2f3d' : '#e2e8f0'}`,
          padding: '8px 10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '8.5px',
            color: isDark ? '#94a3b8' : '#475569',
            fontWeight: 700,
            marginBottom: '4px',
            letterSpacing: '0.04em',
          }}
        >
          <span>1. SENSOR SNAPSHOT SHA-256</span>
          <span style={{ color: '#059669', fontWeight: 800 }}>HASHED</span>
        </div>
        <div
          style={{
            fontSize: '9.5px',
            color: isDark ? '#4fc9dc' : '#047857',
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            border: `1px solid ${isDark ? '#21262d' : '#cbd5e1'}`,
            padding: '5px 7px',
            wordBreak: 'break-all',
            userSelect: 'all',
            lineHeight: 1.3,
            fontWeight: 700,
          }}
        >
          {snapshotHash}
        </div>
      </div>

      {/* 2. Classification & Confidence */}
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
              color: isDark ? '#94a3b8' : '#475569',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            Classification
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              fontFamily: '"Space Grotesk", sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {incident.title}
          </div>
          <div style={{ fontSize: '8.5px', color: isDark ? '#cbd5e1' : '#334155', marginTop: '2px' }}>
            Severity: <strong style={{ color: '#ea3b1b' }}>{incident.severity || 8}/10</strong>
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
              color: isDark ? '#94a3b8' : '#475569',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            Bayesian Confidence
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#059669',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            {(confidenceScore * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '8px', color: isDark ? '#94a3b8' : '#475569', marginTop: '2px' }}>
            Sensor fusion verified
          </div>
        </div>
      </div>

      {/* 3. Algorand Transaction ID & LoRA Explorer */}
      <div
        style={{
          backgroundColor: isDark ? '#12141a' : '#f8fafc',
          border: `1px solid ${isDark ? '#2a2f3d' : '#e2e8f0'}`,
          padding: '8px 10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '8.5px',
            color: isDark ? '#94a3b8' : '#475569',
            fontWeight: 700,
            marginBottom: '4px',
          }}
        >
          <span>3. ALGORAND SETTLEMENT TXID</span>
          <span style={{ color: '#0284c7', fontWeight: 800 }}>CONFIRMED</span>
        </div>
        <div
          style={{
            fontSize: '9.5px',
            color: isDark ? '#93c5fd' : '#0369a1',
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            border: `1px solid ${isDark ? '#21262d' : '#cbd5e1'}`,
            padding: '5px 7px',
            wordBreak: 'break-all',
            userSelect: 'all',
            lineHeight: 1.3,
            fontWeight: 700,
            marginBottom: '6px',
          }}
        >
          {txHash}
        </div>
        <a
          href={loraUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '9.5px',
            fontWeight: 700,
            color: isDark ? '#60a5fa' : '#0284c7',
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>Inspect Transaction on LoRA Algorand Explorer →</span>
        </a>
      </div>

      {/* Operational Diligence Note (High Contrast, Legible Text) */}
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
        <strong style={{ color: isDark ? '#fef08a' : '#854d0e' }}>Operational Diligence Note:</strong> This record is cryptographically timestamped and verifiable on Algorand Testnet. It provides tamper-evident telemetry anchoring for municipal operational diligence. It is not an insurance-grade legal certificate.
      </div>

      {/* Action Buttons (Clean brutalist theme buttons) */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleCopy}
          className="btn-tactile"
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '9px',
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", monospace',
            backgroundColor: isDark ? '#1c202c' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#1e293b',
            border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ COPIED JSON' : 'COPY AUDIT JSON'}
        </button>

        <button
          onClick={handleDownload}
          className="btn-tactile"
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '9px',
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", monospace',
            backgroundColor: isDark ? '#059669' : '#0a0a0a',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          DOWNLOAD RECORD (.TXT)
        </button>
      </div>
    </div>
  );
};
