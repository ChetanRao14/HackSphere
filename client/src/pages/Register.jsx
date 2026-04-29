import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ROLES = [
  {
    value: 'participant',
    emoji: '🎓',
    label: 'Participant',
    desc: 'Register team & submit project',
    color: '#4f46e5',
    shadow: 'rgba(79,70,229,0.2)',
    border: '#c7d2fe',
    bg: '#eef2ff',
  },
  {
    value: 'judge',
    emoji: '⚖️',
    label: 'Judge',
    desc: 'Evaluate teams & winners',
    color: '#0891b2',
    shadow: 'rgba(8,145,178,0.2)',
    border: '#a5f3fc',
    bg: '#ecfeff',
  },
  {
    value: 'admin',
    emoji: '👑',
    label: 'Admin',
    desc: 'Manage global hackathons',
    color: '#d97706',
    shadow: 'rgba(217,119,6,0.2)',
    border: '#fcd34d',
    bg: '#fffbeb',
    requiresCode: true,
  },
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'participant', adminCode: '', college: '', place: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const selectedRole = ROLES.find(r => r.value === formData.role);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 18px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '15px',
    fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.25s',
    background: '#f8fafc', color: '#0f172a',
    boxSizing: 'border-box',
  };
  const focusIn = (c) => (e) => { e.target.style.borderColor = c || '#4f46e5'; e.target.style.background = 'white'; e.target.style.boxShadow = `0 0 0 3px ${c ? c + '30' : 'rgba(79,70,229,0.15)'}`; };
  const focusOut = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; };

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', background: 'white', padding: '60px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🎉</div>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px', letterSpacing: '-1px' }}>You're in!</h2>
        <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Account created. Redirecting to sign in...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif", background: '#f8fafc' }}>

      {/* ── LEFT BRANDING ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px',
        background: 'linear-gradient(145deg, #eff6ff 0%, #e0e7ff 50%, #ede9fe 100%)',
        position: 'relative', overflow: 'hidden',
        borderRight: '1px solid #e2e8f0'
      }}>
        {/* Soft decor blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ marginBottom: '64px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>HackSphere</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#0f172a', margin: '0 0 18px', lineHeight: 1.2, letterSpacing: '-1px' }}>
            Your next big idea<br/>
            <span style={{ background: 'linear-gradient(90deg, #4f46e5, #9333ea, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>starts here.</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.75', margin: '0 0 48px', maxWidth: '360px', fontWeight: '500' }}>
            Register, build your team, and compete with innovators worldwide.
          </p>

          {/* Feature list */}
          {[
            ['⚡', 'Instant team registration'],
            ['🗺️', 'Global & local events'],
            ['🏅', 'Real cash prizes up to $50K'],
            ['🤝', 'Connect with top mentors'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{icon}</div>
              <span style={{ color: '#334155', fontSize: '14px', fontWeight: '600' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Upcoming event card */}
        <div style={{ marginTop: '56px', position: 'relative', zIndex: 1, background: 'white', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            <span style={{ color: '#15803d', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Now</span>
          </div>
          <p style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px', margin: '0 0 4px' }}>HackSphere Global '26</p>
          <p style={{ color: '#64748b', fontSize: '12px', margin: 0, fontWeight: '500' }}>1,240 teams registered · Closes in 3 days</p>
        </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div style={{ width: '500px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 44px', background: 'white', position: 'relative', overflowY: 'auto' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Join HackSphere</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>Create your free account in seconds</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name *</label>
              <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Jane Doe" style={inputStyle} onFocus={focusIn()} onBlur={focusOut} />
            </div>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email *</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} onFocus={focusIn()} onBlur={focusOut} />
            </div>
            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password *</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" style={inputStyle} onFocus={focusIn()} onBlur={focusOut} />
            </div>

            {/* Global Demographic Info (Only for Participants & Judges) */}
            {formData.role !== 'admin' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>College / Org *</label>
                  <input name="college" required value={formData.college} onChange={handleChange} placeholder="e.g. Stanford / Google" style={inputStyle} onFocus={focusIn()} onBlur={focusOut} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Place / City *</label>
                  <input name="place" required value={formData.place} onChange={handleChange} placeholder="e.g. Bengaluru" style={inputStyle} onFocus={focusIn()} onBlur={focusOut} />
                </div>
              </div>
            )}

            {/* Role Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>I'm joining as</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {ROLES.map(role => {
                  const sel = formData.role === role.value;
                  return (
                    <button key={role.value} type="button"
                      onClick={() => setFormData({ ...formData, role: role.value, adminCode: '' })}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', padding: '16px 8px',
                        borderRadius: '14px', cursor: 'pointer',
                        border: `1.5px solid ${sel ? role.border : '#e2e8f0'}`,
                        background: sel ? role.bg : '#f8fafc',
                        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                        boxShadow: sel ? `0 0 0 3px ${role.shadow}` : 'none',
                      }}
                    >
                      <span style={{ fontSize: '22px', lineHeight: 1 }}>{role.emoji}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: sel ? role.color : '#475569' }}>{role.label}</span>
                      <span style={{ fontSize: '10px', color: sel ? role.color : '#94a3b8', fontWeight: '600', textAlign: 'center', lineHeight: 1.3, padding: '0 4px' }}>{role.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>



            {/* Admin Code */}
            {formData.role === 'admin' && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px' }}>🔐</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#b45309' }}>Admin Access Required</span>
                </div>
                <p style={{ fontSize: '12px', color: '#92400e', margin: '0 0 10px', lineHeight: '1.5', fontWeight: '500' }}>
                  Enter the secret admin code to unlock admin privileges.
                </p>
                <input name="adminCode" type="password" value={formData.adminCode} onChange={handleChange}
                  placeholder="Enter admin access code"
                  style={{ ...inputStyle, borderColor: '#fcd34d', background: 'white' }}
                  onFocus={focusIn('#f59e0b')} onBlur={focusOut}
                />
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', border: 'none', marginTop: '4px',
                background: loading ? '#cbd5e1' : `linear-gradient(135deg, ${selectedRole?.color || '#4f46e5'}, #8b5cf6)`,
                color: 'white', fontSize: '15px', fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                boxShadow: loading ? 'none' : `0 4px 15px ${selectedRole?.shadow || 'rgba(99,102,241,0.2)'}`,
                letterSpacing: '0.02em'
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 20px ${selectedRole?.shadow}`; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 15px ${selectedRole?.shadow}`; }}
            >
              {loading ? 'Creating account...' : `Create ${selectedRole?.label} Account →`}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#4f46e5', fontWeight: '800', textDecoration: 'none' }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
