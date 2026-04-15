import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors = {
  upcoming:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: '🔵 Upcoming' },
  active:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '🟢 Active' },
  closed:    { bg: '#fefce8', color: '#a16207', border: '#fef08a', label: '🟡 Closed' },
  completed: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: '⚫ Completed' },
};

const StatusBadge = ({ status }) => {
  const s = statusColors[status] || statusColors.upcoming;
  return <span style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>{s.label}</span>;
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{value}</p>
    </div>
  </div>
);

const defaultForm = { title: '', description: '', location: '', mode: 'in-person', registrationDeadline: '', eventStartDate: '', eventEndDate: '', maxTeams: 50, prizePool: '', status: 'upcoming', tags: '' };

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'hackathons' | 'new' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, hackRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/hackathons`)
      ]);
      setStats(statsRes.data);
      setHackathons(hackRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openNew = () => { setForm(defaultForm); setEditTarget(null); setError(''); setView('new'); };
  const openEdit = (h) => {
    setEditTarget(h);
    setForm({
      ...h,
      registrationDeadline: h.registrationDeadline ? new Date(h.registrationDeadline).toISOString().slice(0, 16) : '',
      eventStartDate: h.eventStartDate ? new Date(h.eventStartDate).toISOString().slice(0, 16) : '',
      eventEndDate: h.eventEndDate ? new Date(h.eventEndDate).toISOString().slice(0, 16) : '',
      tags: Array.isArray(h.tags) ? h.tags.join(', ') : ''
    });
    setError('');
    setView('edit');
  };

  // ── Client-side date validation ──────────────────────────────────────────
  const validateFormDates = () => {
    const today = new Date();
    const reg   = form.registrationDeadline ? new Date(form.registrationDeadline) : null;
    const start = form.eventStartDate       ? new Date(form.eventStartDate)       : null;
    const end   = form.eventEndDate         ? new Date(form.eventEndDate)         : null;

    if (!reg || !start || !end) return 'Please fill in all three date fields.';
    if (reg < today)   return 'Registration deadline cannot be in the past.';
    if (reg >= start)  return 'Registration deadline must be before the event start date.';
    if (start >= end)  return 'Event start date must be before the event end date.';
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // Run client-side check first — avoids unnecessary network round-trips
    const dateErr = validateFormDates();
    if (dateErr) { setError(dateErr); return; }

    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editTarget) {
        await axios.put(`${API}/admin/hackathon/${editTarget._id}`, payload);
        setSuccess('Hackathon updated successfully!');
      } else {
        await axios.post(`${API}/admin/hackathon`, payload);
        setSuccess('Hackathon created successfully!');
      }
      await fetchAll();
      setView('hackathons');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hackathon? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/admin/hackathon/${id}`);
      setHackathons(h => h.filter(x => x._id !== id));
      setSuccess('Hackathon deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Delete failed.'); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'white', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.2s' };
  const focusIn = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; };
  const focusOut = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  const sideItems = [
    { key: 'dashboard', icon: '📊', label: 'Overview' },
    { key: 'hackathons', icon: '🏆', label: 'Hackathons' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontWeight: '500' }}>Loading admin panel...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0 }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ padding: '16px 12px 12px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Admin Panel</p>
          </div>
          {sideItems.map(item => (
            <button key={item.key} onClick={() => setView(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === item.key ? '700' : '500', transition: 'all 0.15s',
                background: view === item.key ? '#eef2ff' : 'transparent',
                color: view === item.key ? '#6366f1' : '#64748b',
              }}
            ><span>{item.icon}</span>{item.label}</button>
          ))}
          <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }} />
          <button onClick={openNew}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
          ><span>➕</span> New Hackathon</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {success && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>✅ {success}</div>}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>❌ {error}</div>}

        {/* ── OVERVIEW ── */}
        {view === 'dashboard' && stats && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome back, {user?.name} 👋</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Here's what's happening on HackSphere today.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <StatCard icon="🏆" label="Hackathons" value={stats.totalHackathons} color="#eef2ff" />
              <StatCard icon="👥" label="Total Teams" value={stats.totalTeams} color="#f0fdf4" />
              <StatCard icon="👤" label="Users" value={stats.totalUsers} color="#fffbeb" />
              <StatCard icon="⏳" label="Pending" value={stats.pendingTeams} color="#fef2f2" />
            </div>

            {/* Status breakdown */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>Submissions by Status</h3>
              {stats.statusBreakdown.length === 0 ? (
                <p style={{ color: '#94a3b8', margin: 0 }}>No submissions yet.</p>
              ) : stats.statusBreakdown.map(s => {
                const colors = { pending: '#f59e0b', accepted: '#22c55e', rejected: '#ef4444' };
                const total = stats.totalTeams || 1;
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={s._id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>{s._id}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{s.count} <span style={{ color: '#94a3b8', fontWeight: '500' }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[s._id] || '#6366f1', borderRadius: '100px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent hackathons */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Hackathons</h3>
                <button onClick={() => setView('hackathons')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View all →</button>
              </div>
              {hackathons.slice(0, 3).map(h => (
                <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '10px', background: '#f8fafc', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 3px', fontSize: '14px' }}>{h.title}</p>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px', fontWeight: '500' }}>📍 {h.location} · 📅 {new Date(h.eventStartDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={h.status} />
                </div>
              ))}
              {hackathons.length === 0 && <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>No hackathons scheduled yet. <button onClick={openNew} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>Create one →</button></p>}
            </div>
          </div>
        )}

        {/* ── HACKATHONS LIST ── */}
        {view === 'hackathons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Hackathons</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{hackathons.length} scheduled event{hackathons.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={openNew}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >➕ Schedule New</button>
            </div>

            {hackathons.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏆</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>No hackathons yet</h3>
                <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: '14px' }}>Schedule your first hackathon to get started.</p>
                <button onClick={openNew} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Create Hackathon</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {hackathons.map(h => (
                  <div key={h._id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{h.title}</h3>
                          <StatusBadge status={h.status} />
                          <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>
                            {h.mode === 'in-person' ? '🏢 In-Person' : h.mode === 'online' ? '💻 Online' : '🔀 Hybrid'}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 14px', lineHeight: '1.6' }}>{h.description.length > 150 ? h.description.slice(0, 150) + '...' : h.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                          {[
                            { icon: '📍', label: h.location },
                            { icon: '📅', label: `${new Date(h.eventStartDate).toLocaleString()} → ${new Date(h.eventEndDate).toLocaleString()}` },
                            { icon: '⏰', label: `Register by ${new Date(h.registrationDeadline).toLocaleString()}` },
                            { icon: '👥', label: `Max ${h.maxTeams} teams` },
                            h.prizePool ? { icon: '🏅', label: h.prizePool } : null,
                          ].filter(Boolean).map((info, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                              <span>{info.icon}</span>{info.label}
                            </span>
                          ))}
                        </div>
                        {h.tags?.length > 0 && <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {h.tags.map((t, i) => <span key={i} style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>#{t}</span>)}
                        </div>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => openEdit(h)} style={{ padding: '8px 16px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}
                        >✏️ Edit</button>
                        <button onClick={() => handleDelete(h._id)} style={{ padding: '8px 16px', border: '1.5px solid #fecaca', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        >🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE / EDIT FORM ── */}
        {(view === 'new' || view === 'edit') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <button onClick={() => setView('hackathons')} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>←</button>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>{view === 'edit' ? 'Edit Hackathon' : 'Schedule New Hackathon'}</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{view === 'edit' ? `Editing: ${editTarget?.title}` : 'Fill in the details to schedule a hackathon'}</p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🏆 Hackathon Details
                </span>
              </div>

              <form onSubmit={handleSave} style={{ padding: '32px', display: 'grid', gap: '22px' }}>
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hackathon Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. HackSphere 2025 — Innovation Challenge" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description *</label>
                  <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the hackathon theme, goals, judging criteria..." style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }} onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Location + Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location / Venue *</label>
                    <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. MIT Campus, Cambridge MA" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode *</label>
                    <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut}>
                      <option value="in-person">🏢 In-Person</option>
                      <option value="online">💻 Online</option>
                      <option value="hybrid">🔀 Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Dates — with validation hints */}
                {(() => {
                  const today = new Date().toISOString().slice(0, 16);
                  const regD   = form.registrationDeadline;
                  const startD = form.eventStartDate;
                  const endD   = form.eventEndDate;

                  const regErr   = regD   && regD < today                    ? '⚠️ Must be in the future'     : regD && startD && regD >= startD ? '⚠️ Must be before event start' : null;
                  const startErr = startD && regD  && startD <= regD          ? '⚠️ Must be after deadline'      : startD && endD && startD >= endD  ? '⚠️ Must be before end date'   : null;
                  const endErr   = endD   && startD && endD   <= startD       ? '⚠️ Must be after start date'    : null;

                  const fieldBorder = (err) => ({ ...inputStyle, borderColor: err ? '#ef4444' : '#e2e8f0', boxShadow: err ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none' });
                  const hintStyle   = { fontSize: '12px', marginTop: '5px', fontWeight: '600', color: '#ef4444' };
                  const okStyle     = { fontSize: '12px', marginTop: '5px', fontWeight: '500', color: '#94a3b8' };

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Deadline *</label>
                        <input required type="datetime-local" min={today} value={regD} onChange={e => setForm({ ...form, registrationDeadline: e.target.value })} style={fieldBorder(regErr)} onFocus={focusIn} onBlur={focusOut} />
                        {regErr ? <p style={hintStyle}>{regErr}</p> : <p style={okStyle}>Must be before event start</p>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Start Time *</label>
                        <input required type="datetime-local" min={regD || today} value={startD} onChange={e => setForm({ ...form, eventStartDate: e.target.value })} style={fieldBorder(startErr)} onFocus={focusIn} onBlur={focusOut} />
                        {startErr ? <p style={hintStyle}>{startErr}</p> : <p style={okStyle}>Must be after deadline</p>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event End Time *</label>
                        <input required type="datetime-local" min={startD || regD || today} value={endD} onChange={e => setForm({ ...form, eventEndDate: e.target.value })} style={fieldBorder(endErr)} onFocus={focusIn} onBlur={focusOut} />
                        {endErr ? <p style={hintStyle}>{endErr}</p> : <p style={okStyle}>Must be after start date</p>}
                      </div>
                    </div>
                  );
                })()}

                {/* Max Teams + Prize + Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Teams</label>
                    <input type="number" min="1" max="1000" value={form.maxTeams} onChange={e => setForm({ ...form, maxTeams: e.target.value })} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prize Pool</label>
                    <input value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} placeholder="e.g. $10,000 in prizes" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                      <option value="upcoming">🔵 Upcoming</option>
                      <option value="active">🟢 Active</option>
                      <option value="closed">🟡 Closed</option>
                      <option value="completed">⚫ Completed</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</label>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px' }}>Comma-separated. e.g. AI, Web3, Healthcare</p>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="AI, Machine Learning, Web3" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <button type="submit" disabled={saving}
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: saving ? 'none' : '0 4px 15px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}
                  >{saving ? '⏳ Saving...' : (view === 'edit' ? '✅ Save Changes' : '🚀 Schedule Hackathon')}</button>
                  <button type="button" onClick={() => setView('hackathons')}
                    style={{ padding: '14px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
