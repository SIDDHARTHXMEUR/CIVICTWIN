import React, { useEffect, useState, useCallback } from 'react';
import { Incident, InfrastructurePoint } from './types';
import { fetchIncidents, fetchInfrastructurePoints } from './services/api';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { CityMap } from './components/CityMap';
import { ActionQueue } from './components/ActionQueue';
import { IncidentDrawer } from './components/IncidentDrawer';
import { SimulatorModal } from './components/SimulatorModal';
import { CitizenReport } from './components/CitizenReport';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructurePoint[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulatingIncidentId, setSimulatingIncidentId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'report'>('dashboard');

  // The browser history acts as a bidirectional page chain: each in-app screen
  // is linked to the previous and next CivicTwin screen before the user leaves.
  useEffect(() => {
    const savedView = window.history.state?.civictwinView;
    if (savedView !== 'dashboard' && savedView !== 'report') {
      window.history.replaceState({ civictwinView: 'dashboard' }, '', window.location.href);
    } else {
      setActiveView(savedView);
    }
    const onPopState = (event: PopStateEvent) => {
      const view = event.state?.civictwinView;
      if (view === 'dashboard' || view === 'report') setActiveView(view);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const changeView = (view: 'dashboard' | 'report') => {
    if (view === activeView) return;
    window.history.pushState({ civictwinView: view }, '', window.location.href);
    setActiveView(view);
  };

  // Filters
  const [category, setCategory] = useState<string>('');
  const [minSeverity, setMinSeverity] = useState<number>(0);
  const [escalationRisk, setEscalationRisk] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [showResolved, setShowResolved] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const incData = await fetchIncidents({
        category: category || undefined,
        min_severity: minSeverity > 0 ? minSeverity : undefined,
        escalation_risk: escalationRisk || undefined,
        status: status || undefined,
        include_resolved: showResolved
      });
      setIncidents(incData);

      const infraData = await fetchInfrastructurePoints();
      setInfrastructure(infraData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [category, minSeverity, escalationRisk, status, showResolved]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket for Live Engine Updates
  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || `ws://${host}:8000/ws/incidents`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setWsConnected(true);
      };
      socket.onclose = () => {
        setWsConnected(false);
      };
      socket.onerror = () => {
        setWsConnected(false);
      };
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'incident_updated' || msg.type === 'new_report') {
          loadData();
        }
      };
    } catch (e) {
      setWsConnected(false);
    }

    return () => {
      if (socket) socket.close();
    };
  }, [loadData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#070A10' }}>
      <Header wsConnected={wsConnected} onRefresh={loadData} activeView={activeView} onViewChange={changeView} />

      {activeView === 'report' ? <CitizenReport onSubmitted={() => { loadData(); setTimeout(loadData, 1800); }} /> : <>
        <StatsOverview incidents={incidents} />
        <FilterBar category={category} setCategory={setCategory} minSeverity={minSeverity} setMinSeverity={setMinSeverity} escalationRisk={escalationRisk} setEscalationRisk={setEscalationRisk} status={status} setStatus={setStatus} showResolved={showResolved} setShowResolved={setShowResolved} onReset={() => { setCategory(''); setMinSeverity(0); setEscalationRisk(''); setStatus(''); setShowResolved(true); }} />
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '68% 32%', gap: '16px', padding: '0 20px 20px 20px', minHeight: '560px' }}>
          <CityMap incidents={incidents} infrastructure={infrastructure} selectedIncident={selectedIncident} onSelectIncident={setSelectedIncident} />
          <ActionQueue incidents={incidents} selectedIncident={selectedIncident} onSelectIncident={setSelectedIncident} />
        </main>
      </>}

      {/* Detail Slide Drawer */}
      <IncidentDrawer
        incidentId={selectedIncident?.id || null}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onOpenSimulator={(id) => setSimulatingIncidentId(id)}
        onStatusChanged={loadData}
      />

      {/* Civic Impact Simulator Modal */}
      <SimulatorModal
        incidentId={simulatingIncidentId}
        onClose={() => setSimulatingIncidentId(null)}
      />
    </div>
  );
}
