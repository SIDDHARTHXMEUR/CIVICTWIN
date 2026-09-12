import React, { useEffect, useState } from 'react';
import { Incident, IncidentDetail } from '../types';
import { fetchIncidentDetail, updateIncidentStatus } from '../services/api';
import { X, Sparkles, AlertTriangle, ShieldCheck, Flame, Users, Play, CheckCircle2, Clock, MapPin, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  incidentId: string | null;
  incident: Incident | null;
  onClose: () => void;
  onOpenSimulator: (incId: string) => void;
  onStatusChanged: () => void;
}

export const IncidentDrawer: React.FC<Props> = ({
  incidentId,
  incident,
  onClose,
  onOpenSimulator,
  onStatusChanged
}) => {
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(6);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const pipelineStages = ['Pulling report evidence…', 'Computing severity breakdown…', 'Checking nearby critical infrastructure…', 'Assessing escalation risk…', 'Generating summary & recommended action…'];

  const resolutionDuration = (reported: string, resolved: string) => {
    const hours = Math.max(0, Math.floor((new Date(resolved).getTime() - new Date(reported).getTime()) / 3600000));
    return hours >= 24 ? `${Math.floor(hours / 24)} day${hours >= 48 ? 's' : ''} ${hours % 24} hr${hours % 24 === 1 ? '' : 's'}` : `${hours} hr${hours === 1 ? '' : 's'}`;
  };

  useEffect(() => {
    if (!incidentId) {
      setDetail(null);
      setLoadError(false);
      return;
    }

    async function loadDetail() {
      setLoading(true);
      setLoadError(false);
      setStage(0);
      setProgress(6);
      try {
        const data = await fetchIncidentDetail(incidentId!);
        setProgress(100);
        setDetail(data);
      } catch (err) {
        console.error(err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [incidentId, retryCount]);

  useEffect(() => {
    if (!loading) return;
    const stageTimer = window.setInterval(() => setStage(current => (current + 1) % pipelineStages.length), 650);
    const progressTimer = window.setInterval(() => setProgress(current => Math.min(90, current + Math.max(2, (90 - current) * 0.16))), 180);
    return () => { window.clearInterval(stageTimer); window.clearInterval(progressTimer); };
  }, [loading]);

  if (!incidentId) return null;

  const handleUpdateStatus = async (newStatus: 'open' | 'in_progress' | 'resolved') => {
    setUpdating(true);
    try {
      const updated = await updateIncidentStatus(incidentId, newStatus);
      if (detail) {
        setDetail({ ...detail, status: newStatus, resolved_at: updated.resolved_at });
      }
      onStatusChanged();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  // Format severity breakdown chart data
  const breakdownData = detail?.severity_breakdown ? [
    { name: 'Report Vol', score: detail.severity_breakdown.report_volume_score || 0, fill: '#06B6D4' },
    { name: 'Citizens', score: detail.severity_breakdown.citizen_reach_score || 0, fill: '#3B82F6' },
    { name: 'Cat Weight', score: detail.severity_breakdown.issue_category_weight || 0, fill: '#8B5CF6' },
    { name: 'Infra Prox', score: detail.severity_breakdown.critical_infra_proximity || 0, fill: '#EC4899' },
    { name: 'Velocity', score: detail.severity_breakdown.growth_velocity_factor || 0, fill: '#F59E0B' }
  ] : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '460px',
      height: '100vh',
      background: 'rgba(9, 13, 22, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#06B6D4', fontWeight: 700, textTransform: 'uppercase' }}>
            Incident Detail Panel
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#F8FAFC' }}>
            {(detail || incident) ? (detail || incident)!.issue_type.replace('_', ' ').toUpperCase() : 'Loading...'}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#94A3B8',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {loading || !detail ? (
        <div style={{ flex: 1, padding: '20px', color: '#94A3B8', overflowY: 'auto' }}>
          {incident && <div style={{ background: 'rgba(6,182,212,.10)', border: '1px solid rgba(6,182,212,.25)', borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <p style={{ color: '#67E8F9', fontWeight: 800, fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Immediate incident signal</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, fontSize: '.84rem', color: '#E2E8F0' }}><span>{incident.report_count} linked report{incident.report_count === 1 ? '' : 's'}</span><strong>Severity {incident.severity_score}/100</strong></div>
            <p style={{ fontSize: '.76rem', marginTop: 7 }}>First reported {new Date(incident.first_reported_at).toLocaleString()}</p>
          </div>}
          {loadError ? <div style={{ textAlign: 'center', padding: '34px 8px' }}><AlertTriangle size={28} color="#F59E0B" /><h3 style={{ color: '#F8FAFC', margin: '12px 0 7px' }}>Couldn’t load full diagnostics</h3><p style={{ fontSize: '.82rem', lineHeight: 1.5 }}>Basic incident information is shown above. The detailed analysis is still available to retry.</p><button onClick={() => setRetryCount(value => value + 1)} style={{ marginTop: 16, border: '1px solid #06B6D4', background: 'rgba(6,182,212,.15)', color: '#67E8F9', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer' }}>Retry diagnostics</button></div> : <>
            <p style={{ color: '#67E8F9', fontSize: '.84rem', fontWeight: 700, textAlign: 'center', margin: '6px 0 12px' }}>{pipelineStages[stage]}</p>
            <div style={{ height: 5, background: '#1E293B', borderRadius: 5, overflow: 'hidden', marginBottom: 22 }}><div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#06B6D4,#8B5CF6)', transition: 'width .18s ease' }} /></div>
            <Skeleton width="48%" height={18} /><Skeleton width="27%" height={25} marginTop={14} /><Skeleton width="100%" height={76} marginTop={18} /><Skeleton width="72%" height={13} marginTop={12} /><Skeleton width="91%" height={13} marginTop={8} /><Skeleton width="57%" height={13} marginTop={8} /><div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 18 }}><Skeleton width="46%" height={16} /><Skeleton width="100%" height={130} marginTop={14} /></div>
          </>}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* AI Summary & Action Banner */}
          <div style={{ background: detail.resolved_at ? 'rgba(16,185,129,.12)' : 'rgba(59,130,246,.10)', border: `1px solid ${detail.resolved_at ? 'rgba(16,185,129,.45)' : 'rgba(59,130,246,.35)'}`, borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: detail.resolved_at ? '#6EE7B7' : '#93C5FD', fontWeight: 800, fontSize: '.82rem', marginBottom: 7 }}><Clock size={16} /> Reported → Resolved timeline</div>
            <p style={{ fontSize: '.8rem', color: '#CBD5E1' }}><strong>Reported:</strong> {new Date(detail.first_reported_at).toLocaleString()}</p>
            {detail.resolved_at ? <><p style={{ fontSize: '.8rem', color: '#CBD5E1', marginTop: 4 }}><strong>Resolved:</strong> {new Date(detail.resolved_at).toLocaleString()}</p><p style={{ color: '#6EE7B7', fontWeight: 700, marginTop: 8, fontSize: '.82rem' }}>Resolved in {resolutionDuration(detail.first_reported_at, detail.resolved_at)}</p></> : <p style={{ color: '#93C5FD', marginTop: 7, fontSize: '.8rem' }}>Awaiting authority resolution.</p>}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="#06B6D4" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06B6D4' }}>AI Synthesis & Action</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#F8FAFC', marginBottom: '12px', lineHeight: '1.4' }}>
              {detail.ai_summary}
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '10px 12px',
              borderRadius: '10px',
              borderLeft: '3px solid #10B981',
              fontSize: '0.8rem',
              color: '#CBD5E1'
            }}>
              <strong style={{ color: '#10B981' }}>Recommended Action:</strong> {detail.recommended_action}
            </div>

            {/* Workflow Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={updating || detail.status === 'in_progress'}
                style={{
                  flex: 1,
                  background: detail.status === 'in_progress' ? '#3B82F6' : 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid #3B82F6',
                  color: '#FFF',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                In Progress
              </button>
              <button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={updating || detail.status === 'resolved'}
                style={{
                  flex: 1,
                  background: detail.status === 'resolved' ? '#10B981' : 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  color: '#FFF',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Resolve
              </button>
            </div>
          </div>

          {/* Civic Impact Simulator Launcher */}
          <button
            onClick={() => onOpenSimulator(incidentId)}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              color: '#FFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)'
            }}
          >
            <Play size={18} /> Launch Civic Impact Simulator
          </button>

          {/* Severity Score Breakdown (Explainability) */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Severity Score Breakdown</h3>
              <span className="severity-badge severity-critical">
                Total: {detail.severity_score}/100
              </span>
            </div>

            <div style={{ height: '140px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 40]} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Root Cause Inference */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
              Root Cause Inference
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#F8FAFC', fontWeight: 600, marginBottom: '6px' }}>
              {detail.root_cause}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#10B981', marginBottom: '10px' }}>
              Confidence Rating: {((detail.root_cause_confidence || 0.85) * 100).toFixed(0)}% (Grounded)
            </p>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              <strong>Evidence Signals:</strong>
              <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                {detail.root_cause_evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Infrastructure Impact Join */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#EC4899" /> Nearby Critical Infrastructure
            </h3>
            {detail.infrastructure_impacts.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>No critical infrastructure within 1km radius.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {detail.infrastructure_impacts.map((imp) => (
                  <div key={imp.infrastructure_id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    background: 'rgba(30, 41, 59, 0.5)',
                    padding: '8px 12px',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{imp.name}</span>
                    <span style={{ color: '#EC4899', fontFamily: 'var(--font-mono)' }}>{imp.distance_meters}m away</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Member Citizen Reports Evidence Gallery */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
              Citizen Evidence ({detail.reports.length} Reports)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {detail.reports.map((rep) => (
                <div key={rep.id} style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '10px',
                  padding: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <p style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '6px' }}>"{rep.raw_text}"</p>
                  {rep.photo_urls && rep.photo_urls.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {rep.photo_urls.map((url, i) => (
                        <img key={i} src={url} alt="Evidence" style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

function Skeleton({ width, height, marginTop = 0 }: { width: string; height: number; marginTop?: number }) {
  return <div style={{ width, height, marginTop, borderRadius: 7, background: 'linear-gradient(90deg, #172033 25%, #26344d 45%, #172033 65%)', backgroundSize: '300% 100%', animation: 'civictwinShimmer 1.4s ease-in-out infinite' }} />;
}
