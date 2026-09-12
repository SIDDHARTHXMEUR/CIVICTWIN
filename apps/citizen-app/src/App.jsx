import React, { useState } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ReportStatusCard from './components/ReportStatusCard';
import NearbyIncidentsMap from './components/NearbyIncidentsMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('report'); // report | map
  const [latestSubmittedReport, setLatestSubmittedReport] = useState(null);

  const handleReportSubmitted = (report) => {
    setLatestSubmittedReport(report);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, paddingBottom: '30px' }}>
        {activeTab === 'report' ? (
          <>
            <ReportStatusCard report={latestSubmittedReport} />
            <ReportForm onReportSubmitted={handleReportSubmitted} />
          </>
        ) : (
          <NearbyIncidentsMap />
        )}
      </main>

      <footer style={{
        padding: '16px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#64748B',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        CivicTwin PWA • Responsive Urban Intelligence Layer • NIT Delhi
      </footer>
    </div>
  );
}
