import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { 
  LayoutGrid, 
  Radio, 
  Activity, 
  Leaf, 
  BrainCircuit, 
  Users, 
  Plus, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Banknote
} from 'lucide-react';

const navItems = [
  { id: 'all',            idx: '01', label: 'OVERVIEW',       icon: LayoutGrid },
  { id: 'infrastructure', idx: '02', label: 'INFRASTRUCTURE', icon: Radio },
  { id: 'mobility',       idx: '03', label: 'MOBILITY',       icon: Activity },
  { id: 'environment',    idx: '04', label: 'ENVIRONMENT',    icon: Leaf },
  { id: 'intelligence',   idx: '05', label: 'INTELLIGENCE',   icon: BrainCircuit },
];

interface SidebarProps {
  onNavigate?: (view: 'gateway' | 'dashboard' | 'citizen') => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const incidents = useStore(state => state.incidents);
  const activeDomain = useStore(state => state.activeDomain);
  const setActiveDomain = useStore(state => state.setActiveDomain);
  const theme = useStore(state => state.theme);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDark = theme === 'dark';

  return (
    <aside className="beveled-3d-frame" style={{
      width: isCollapsed ? '56px' : '170px',
      backgroundColor: isDark ? 'rgba(18, 20, 26, 0.94)' : 'rgba(245, 242, 232, 0.94)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      fontFamily: '"Hanken Grotesk", sans-serif',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      zIndex: 100,
      borderRadius: '0px',
    }}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className="btn-tactile"
        style={{
          position: 'absolute',
          right: '-12px',
          top: '18px',
          width: '24px',
          height: '24px',
          borderRadius: '0px',
          backgroundColor: isDark ? '#1c202c' : '#0a0a0a',
          color: '#ffffff',
          border: `1px solid ${isDark ? '#2a2f3d' : '#0a0a0a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo Section */}
      <div>
        {/* Brand Header */}
        <div style={{
          padding: isCollapsed ? '16px 8px' : '16px 14px',
          borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'flex-start',
        }}>
          {!isCollapsed ? (
            <>
              <div style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#ffffff' : '#0a0a0a', letterSpacing: '0.06em' }}>
                CIVICTWIN
              </div>
              <div style={{ fontSize: '9px', fontFamily: '"JetBrains Mono", monospace', color: isDark ? '#9ca3af' : '#3a3a3a', marginTop: '2px', lineHeight: 1.2 }}>
                URBAN DIGITAL TWIN v2.4
              </div>
            </>
          ) : (
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4fc9dc', textAlign: 'center', fontFamily: '"JetBrains Mono", monospace' }}>
              CT
            </div>
          )}
        </div>

        {/* Navigation Items with Monospace Index Numbers & Live Node Counts */}
        <nav style={{ paddingTop: '8px' }}>
          {navItems.map((item) => {
            const isActive = activeDomain === item.id;
            const IconComponent = item.icon;

            const openIncidents = incidents.filter(i => ['reported', 'classified', 'in_progress', 'open'].includes(i.status));
            let badgeCount = 0;
            let hasCritical = false;

            if (item.id === 'all' || item.id === 'intelligence') {
              badgeCount = openIncidents.length;
              hasCritical = openIncidents.some(i => i.tab === 'critical');
            } else {
              const domainIncidents = openIncidents.filter(i => i.category.toLowerCase().includes(item.id.toLowerCase()));
              badgeCount = domainIncidents.length;
              hasCritical = domainIncidents.some(i => i.tab === 'critical');
            }

            return (
              <div 
                key={item.id} 
                onClick={() => setActiveDomain(item.id)}
                title={isCollapsed ? `${item.label} (${badgeCount} incidents)` : undefined}
                className="row-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isCollapsed ? '10px 0' : '10px 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive 
                    ? isDark ? '#1c202c' : '#e8e4d8' 
                    : 'transparent',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid #4fc9dc' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  borderRadius: '0px',
                }}
              >
                <IconComponent size={14} color={isActive ? (isDark ? '#4fc9dc' : '#0a0a0a') : isDark ? '#9ca3af' : '#3a3a3a'} strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? (isDark ? '#ffffff' : '#0a0a0a') : (isDark ? '#9ca3af' : '#3a3a3a'),
                      letterSpacing: '0.04em',
                    }}>
                      {item.label}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {item.id !== 'all' && (
                        <span style={{
                          fontSize: '8.5px',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 800,
                          backgroundColor: badgeCount === 0 
                            ? (isDark ? '#2a2f3d' : '#d5d0c3') 
                            : (hasCritical ? '#ea3b1b' : '#4fc9dc'),
                          color: badgeCount === 0 
                            ? (isDark ? '#9ca3af' : '#374151') 
                            : (hasCritical ? '#ffffff' : '#0a0a0a'),
                          padding: '1px 4px',
                          borderRadius: '0px',
                          minWidth: '12px',
                          textAlign: 'center',
                          transition: 'background-color 0.2s ease, color 0.2s ease',
                        }}>
                          {badgeCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action Section */}
      <div style={{
        padding: isCollapsed ? '10px 6px' : '12px 14px',
        borderTop: `1px solid ${isDark ? '#2a2f3d' : '#e5e7eb'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}>
        {onNavigate && (
          <button
            onClick={() => onNavigate('citizen')}
            title={isCollapsed ? "Citizen Portal" : undefined}
            className="btn-tactile"
            style={{
              width: '100%',
              padding: isCollapsed ? '8px 0' : '7px 8px',
              backgroundColor: isDark ? '#1c202c' : '#ffffff',
              color: '#00a5e3',
              border: `1px solid ${isDark ? '#005073' : '#00364e'}`,
              borderRadius: '0px',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Users size={13} color="#00a5e3" />
            {!isCollapsed && <span>CITIZEN PORTAL</span>}
          </button>
        )}

        <button 
          onClick={() => setActiveDomain('all')}
          title={isCollapsed ? "Deploy Node" : undefined}
          className="btn-tactile"
          style={{
            width: '100%',
            padding: isCollapsed ? '8px 0' : '7px 8px',
            backgroundColor: isDark ? '#b7102a' : '#1a1c17',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0px',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            fontFamily: '"JetBrains Mono", monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Plus size={13} color="#ffffff" />
          {!isCollapsed && <span>DEPLOY NODE</span>}
        </button>

        <div 
          onClick={() => onNavigate?.('gateway')}
          title={isCollapsed ? "Exit / Gateway" : undefined}
          className="btn-tactile"
          style={{ 
            fontSize: '9px', 
            color: isDark ? '#9ca3af' : '#807474', 
            fontFamily: '"JetBrains Mono", monospace',
            padding: '4px 0 2px 0', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '6px',
            letterSpacing: '0.04em',
          }}
        >
          <LogOut size={13} color={isDark ? '#9ca3af' : '#807474'} />
          {!isCollapsed && <span>EXIT / GATEWAY</span>}
        </div>
      </div>
    </aside>
  );
}
