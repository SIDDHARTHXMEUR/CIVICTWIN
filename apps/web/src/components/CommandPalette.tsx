import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Search, Map, LayoutDashboard, UserCheck, CreditCard, Sun, Moon, ShieldAlert, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'gateway' | 'dashboard' | 'citizen') => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const setActiveDomain = useStore(state => state.setActiveDomain);
  const incidents = useStore(state => state.incidents);
  const setFocusedIncidentId = useStore(state => state.setFocusedIncidentId);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIncidents = incidents.filter(i => 
    i.title.toLowerCase().includes(query.toLowerCase()) || 
    i.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const actions = [
    {
      id: 'nav-gateway',
      label: 'Switch to Gateway View',
      icon: Map,
      category: 'Navigation',
      run: () => { onNavigate('gateway'); onClose(); }
    },
    {
      id: 'nav-dashboard',
      label: 'Switch to Control Room Dashboard',
      icon: LayoutDashboard,
      category: 'Navigation',
      run: () => { onNavigate('dashboard'); onClose(); }
    },
    {
      id: 'nav-citizen',
      label: 'Switch to Citizen Reporting App',
      icon: UserCheck,
      category: 'Navigation',
      run: () => { onNavigate('citizen'); onClose(); }
    },
    {
      id: 'domain-payments',
      label: 'Open Micro-Payments & Resolution Audit',
      icon: CreditCard,
      category: 'Domain',
      run: () => { onNavigate('dashboard'); setActiveDomain('payments'); onClose(); }
    },
    {
      id: 'toggle-theme',
      label: `Switch Theme to ${isDark ? 'Light' : 'Dark'} Mode`,
      icon: isDark ? Sun : Moon,
      category: 'Settings',
      run: () => { toggleTheme(); onClose(); }
    }
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={onClose}>
      <div 
        className="beveled-3d-frame"
        style={{
          width: '90%',
          maxWidth: '560px',
          backgroundColor: isDark ? '#12141a' : '#f5f2e8',
          border: `2px solid ${isDark ? '#4fc9dc' : '#0a0a0a'}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '"Space Grotesk", sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
          gap: '10px',
        }}>
          <Search size={18} color={isDark ? '#4fc9dc' : '#0a0a0a'} />
          <input
            type="text"
            placeholder="Type a command or search incidents (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: isDark ? '#f3f4f6' : '#0a0a0a',
              fontSize: '14px',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
            }}
          />
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px 0' }}>
          {/* Quick Actions */}
          {actions.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                padding: '4px 16px',
                fontSize: '10px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                color: isDark ? '#6b7280' : '#888',
                letterSpacing: '0.08em',
              }}>
                SYSTEM ACTIONS
              </div>
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={act.run}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isDark ? '#f3f4f6' : '#1a1c17',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1c202c' : '#e2ded2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Icon size={16} color={isDark ? '#4fc9dc' : '#0a0a0a'} />
                    <span>{act.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Incidents Search Results */}
          {filteredIncidents.length > 0 && (
            <div>
              <div style={{
                padding: '4px 16px',
                fontSize: '10px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                color: isDark ? '#6b7280' : '#888',
                letterSpacing: '0.08em',
              }}>
                ACTIVE INCIDENTS ({filteredIncidents.length})
              </div>
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    setFocusedIncidentId(inc.id);
                    onNavigate('dashboard');
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isDark ? '#f3f4f6' : '#1a1c17',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1c202c' : '#e2ded2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={15} color="#ea3b1b" />
                    <span>{inc.title}</span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: '"JetBrains Mono", monospace',
                    color: '#4fc9dc',
                    padding: '2px 6px',
                    border: '1px solid #4fc9dc',
                  }}>
                    {inc.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {actions.length === 0 && filteredIncidents.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
              No matching commands or incidents found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: isDark ? '#0b0c0e' : '#eae7dc',
          borderTop: `1px solid ${isDark ? '#2a2f3d' : '#d5d0c3'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          color: isDark ? '#6b7280' : '#777',
        }}>
          <span>PRESS ESC TO CLOSE</span>
          <span>CIVICTWIN OPERATIONAL PALETTE</span>
        </div>
      </div>
    </div>
  );
}
