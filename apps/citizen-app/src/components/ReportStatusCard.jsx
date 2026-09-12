import React from 'react';
import { CheckCircle2, Layers, AlertCircle, Clock, MapPin, Sparkles } from 'lucide-react';

export default function ReportStatusCard({ report }) {
  if (!report) return null;

  const isMerged = report.incident_id && report.processing_status === 'processed';

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      margin: '0 16px 20px 16px',
      borderLeft: '4px solid #06B6D4',
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span className={isMerged ? 'badge badge-merged' : 'badge badge-open'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={12} />
          {isMerged ? 'Merged with Existing Incident' : 'Report Logged'}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> {new Date(report.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#F8FAFC', marginBottom: '8px' }}>
        {report.ai_summary || report.raw_text}
      </h3>

      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '12px',
        padding: '12px',
        margin: '12px 0',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={16} color="#06B6D4" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#06B6D4' }}>AI Perception Result</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>
          <strong>Category:</strong> {(report.issue_type || 'General Civic').replace('_', ' ').toUpperCase()}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
          <strong>Status Message:</strong> {isMerged ? 'Merged into an existing municipal incident — multiple citizens have reported this issue nearby.' : 'New municipal incident ticket generated and queued for ward maintenance.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>
        <span>Report ID: #{report.id.substring(0, 8)}</span>
        <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={14} /> Authority Notified
        </span>
      </div>
    </div>
  );
}
