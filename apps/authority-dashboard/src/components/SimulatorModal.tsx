import React, { useState, useEffect } from 'react';
import { Simulation } from '../types';
import { runSimulation } from '../services/api';
import { X, Play, TrendingUp, AlertTriangle, Users, Car, Sparkles, Clock } from 'lucide-react';

interface Props {
  incidentId: string | null;
  onClose: () => void;
}

export const SimulatorModal: React.FC<Props> = ({ incidentId, onClose }) => {
  const [horizonHours, setHorizonHours] = useState<number>(6);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!incidentId) return;
    async function loadSim() {
      setLoading(true);
      try {
        const res = await runSimulation(incidentId!, horizonHours);
        setSimulation(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSim();
  }, [incidentId, horizonHours]);

  if (!incidentId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '620px',
        padding: '24px',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 0 50px rgba(139, 92, 246, 0.2)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={22} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                Civic Impact Simulator
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Predictive Forward Projection Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#FFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Horizon Selector Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '12px' }}>
          {[6, 12, 24].map((h) => (
            <button
              key={h}
              onClick={() => setHorizonHours(h)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: horizonHours === h ? '#8B5CF6' : 'transparent',
                color: horizonHours === h ? '#FFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              +{h} Hours Projection
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: '#8B5CF6', fontWeight: 600 }}>
            Simulating forward spatial growth & traffic cascade...
          </div>
        ) : simulation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Projection KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              
              {/* Population Impact */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <Users size={14} /> Affected Pop
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>
                  {simulation.projected_affected_population.toLocaleString()}
                </h3>
                <span style={{ fontSize: '0.68rem', color: '#10B981' }}>+Compounding Growth</span>
              </div>

              {/* Traffic Disruption */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EC4899', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <Car size={14} /> Traffic Risk
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#EC4899', textTransform: 'uppercase' }}>
                  {simulation.projected_traffic_disruption}
                </h3>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Arterial Corridor</span>
              </div>

              {/* Escalation Probability */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F43F5E', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <AlertTriangle size={14} /> Escalation Prob
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F43F5E' }}>
                  {(simulation.projected_escalation_probability * 100).toFixed(0)}%
                </h3>
                <span style={{ fontSize: '0.68rem', color: '#F43F5E' }}>High Risk Slope</span>
              </div>

            </div>

            {/* AI Reasoning Narrative */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B5CF6', marginBottom: '6px' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Simulation Diagnostic Reasoning</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#F8FAFC', lineHeight: '1.4' }}>
                {simulation.reasoning}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#FFF',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close Projection
              </button>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};
