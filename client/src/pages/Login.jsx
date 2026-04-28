import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ROLES = [
  {
    value: 'participant',
    emoji: '🎓',
    label: 'Participant',
    desc: 'Access your team dashboard',
    color: '#4f46e5',
    shadow: 'rgba(79,70,229,0.2)',
    border: '#c7d2fe',
    bg: '#eef2ff',
  },
  {
    value: 'judge',
    emoji: '⚖️',
    label: 'Judge',
    desc: 'Review team submissions',
    color: '#0891b2',
    shadow: 'rgba(8,145,178,0.2)',
    border: '#a5f3fc',
    bg: '#ecfeff',
  },
  {
    value: 'admin',
    emoji: '👑',
    label: 'Admin',
    desc: 'Manage hackathon events',
    color: '#d97706',
    shadow: 'rgba(217,119,6,0.2)',
    border: '#fcd34d',
    bg: '#fffbeb',
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const selectedRole = ROLES.find(r => r.value === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, { email, password, role });
      login(res.data.user, res.data.token);
      navigate(`/${res.data.user.role}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '15px',
    fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.25s',
    background: '#f8fafc', color: '#0f172a',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif", background: '#f8fafc' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px',
        background: 'linear-gradient(145deg, #eff6ff 0%, #e0e7ff 50%, #ede9fe 100%)',
        position: 'relative', overflow: 'hidden',
        borderRight: '1px solid #e2e8f0'
      }}>
        {/* Soft background decor */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ marginBottom: '56px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>HackSphere</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0, paddingLeft: '54px', fontWeight: '500' }}>Global Hackathon Platform</p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'white', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px', boxShadow: '0 2px 8px rgba(99,102,241,0.1)' }}>
            🚀 Hackathon Season 2026
          </div>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#0f172a', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-1.5px' }}>
            Build the future.<br />
            <span style={{ background: 'linear-gradient(90deg, #4f46e5, #9333ea, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Win big.
            </span>
          </h1>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.7', margin: '0 0 48px', maxWidth: '380px' }}>
            Join thousands of developers, designers, and innovators competing in world-class hackathons.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px' }}>
            {[['10K+', 'Participants'], ['200+', 'Hackathons'], ['$2M+', 'In Prizes']].map(([val, label]) => (
              <div key={label}>
                <p style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' }}>{val}</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: '600' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div style={{ marginTop: 'auto', paddingTop: '60px', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <p style={{ color: '#334155', fontSize: '14px', margin: '0 0 12px', lineHeight: '1.6', fontStyle: 'italic' }}>
              "HackSphere gave us the platform to turn our idea into a real product. We won the AI track and got our first investor!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>A</div>
              <div>
                <p style={{ color: '#0f172a', fontWeight: '800', fontSize: '13px', margin: 0 }}>Arjun Mehta</p>
                <p style={{ color: '#64748b', fontSize: '11px', margin: 0, fontWeight: '500' }}>Winner, HackSphere 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width: '480px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', background: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Welcome back 👋</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 36px' }}>
            Sign in to your HackSphere account
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Role Selector */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>I am logging in as</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {ROLES.map(r => {
                  const sel = role === r.value;
                  return (
                    <button key={r.value} type="button"
                      onClick={() => setRole(r.value)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', padding: '12px 8px',
                        borderRadius: '12px', cursor: 'pointer',
                        border: `1.5px solid ${sel ? r.border : '#e2e8f0'}`,
                        background: sel ? r.bg : '#f8fafc',
                        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                        boxShadow: sel ? `0 0 0 3px ${r.shadow}` : 'none',
                      }}
                    >
                      <span style={{ fontSize: '20px', lineHeight: 1 }}>{r.emoji}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: sel ? r.color : '#475569' }}>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', border: 'none', marginTop: '8px',
                background: loading ? '#cbd5e1' : `linear-gradient(135deg, ${selectedRole.color} 0%, #8b5cf6 100%)`,
                color: 'white', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                boxShadow: loading ? 'none' : `0 4px 15px ${selectedRole.shadow}`,
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 20px ${selectedRole.shadow}`; } }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 15px ${selectedRole.shadow}`; }}
            >
              {loading ? 'Signing in...' : `Sign in as ${selectedRole.label} →`}
            </button>
          </form>

          <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              New to HackSphere?{' '}
              <Link to="/register" style={{ color: '#4f46e5', fontWeight: '800', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#7e22ce'}
                onMouseLeave={e => e.target.style.color = '#4f46e5'}
              >Create a free account →</Link>
            </p>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '🔒', text: 'Secure JWT authentication' },
              { icon: '⚡', text: 'Access your dashboard instantly' },
              { icon: '🏆', text: 'Compete in global hackathons' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
