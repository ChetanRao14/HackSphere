import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleInfo = {
  participant: { color: '#6366f1', bg: '#eef2ff', label: 'Participant' },
  judge:       { color: '#0891b2', bg: '#ecfeff', label: 'Judge' },
  admin:       { color: '#d97706', bg: '#fffbeb', label: 'Admin' },
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const ri = user ? (roleInfo[user.role] || roleInfo.participant) : null;

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, fontFamily: "'Inter', sans-serif", boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Left Side: Logo + Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span style={{ fontWeight: '800', fontSize: '20px', color: '#0f172a', letterSpacing: '-0.5px' }}>HackSphere</span>
          </div>

          {/* Season badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '100px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#15803d', fontSize: '12px', fontWeight: '700' }}>Hackathon Season 2026</span>
          </div>
        </div>

        {/* User + Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, ${ri.color}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px', margin: 0, lineHeight: 1.2 }}>{user.name}</p>
                <span style={{ background: ri.bg, color: ri.color, padding: '1px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>{ri.label}</span>
              </div>
            </div>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'white'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
