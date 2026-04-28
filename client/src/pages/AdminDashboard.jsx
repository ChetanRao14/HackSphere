import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors = {
  announcement: { bg: '#fefce8', color: '#a16207', border: '#fef08a', label: '🔜 Announcement' },
  upcoming:     { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: '🔵 Open' },
  active:       { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '🟢 Active' },
  closed:       { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5', label: '🟡 Closed' },
  completed:    { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: '⚫ Completed' },
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

const defaultForm = { title: '', description: '', location: '', mode: 'in-person', registrationStartDate: '', registrationDeadline: '', eventStartDate: '', eventEndDate: '', maxTeams: 50, prizePool: '', tags: '' };

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
    // Convert UTC dates back to local input format
    const localDateTime = (utcDateStr) => {
      if (!utcDateStr) return '';
      const d = new Date(utcDateStr);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEditTarget(h);
    setForm({
      ...h,
      registrationStartDate: localDateTime(h.registrationStartDate),
      registrationDeadline: localDateTime(h.registrationDeadline),
      eventStartDate: localDateTime(h.eventStartDate),
      eventEndDate: localDateTime(h.eventEndDate),
      tags: Array.isArray(h.tags) ? h.tags.join(', ') : ''
    });
    setError('');
    setView('edit');
  };

  // ── Client-side date validation ──────────────────────────────────────────
  const validateFormDates = () => {
    const today = new Date();
    const regS   = form.registrationStartDate ? new Date(form.registrationStartDate) : null;
    const regD   = form.registrationDeadline  ? new Date(form.registrationDeadline)  : null;
    const start  = form.eventStartDate        ? new Date(form.eventStartDate)        : null;
    const end    = form.eventEndDate          ? new Date(form.eventEndDate)          : null;

    if (!regS || !regD || !start || !end) return 'Please fill in all four date/time fields.';
    if (regS >= regD)  return 'Registration must start before it ends.';
    if (regD >= start) return 'Registration must end before the event begins.';
    if (start >= end)  return 'Event must start before it ends.';
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
    <div style={{ width: '100%', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── GLOBAL WELCOME ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome back, {user?.name} 👋</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Here's your administrative command center.</p>
      </div>

      {/* ── HORIZONTAL ADMIN PANEL ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', background: 'white', borderRadius: '16px', padding: '16px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 12px 0 0' }}>Admin Panel</p>
        
        {sideItems.map(item => (
          <button key={item.key} onClick={() => setView(item.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === item.key ? '700' : '600', transition: 'all 0.15s', background: view === item.key ? '#eef2ff' : 'transparent', color: view === item.key ? '#6366f1' : '#64748b' }}
          ><span>{item.icon}</span>{item.label}</button>
        ))}

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />

        <button onClick={openNew}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '700', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
        ><span>➕</span> New Hackathon</button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ width: '100%' }}>
        {success && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>✅ {success}</div>}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>❌ {error}</div>}

        {/* ── OVERVIEW ── */}
        {view === 'dashboard' && stats && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {/* Stats Row - 5 even columns for a balanced fit */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
              <StatCard icon="🏆" label="Hackathons" value={stats.totalHackathons} color="#eef2ff" />
              <StatCard icon="👥" label="Total Teams" value={stats.totalTeams} color="#f0fdf4" />
              <StatCard icon="🎓" label="Participants" value={stats.totalParticipants} color="#fffbeb" />
              <StatCard icon="⚖️" label="Judges" value={stats.totalJudges} color="#ecfeff" />
              <StatCard icon="👑" label="Admins" value={stats.totalAdmins} color="#fef2f2" />
            </div>

            {/* Dashboard Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              {/* Recent Activity Card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Hackathons</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>Quick access to your latest scheduled events</p>
                  </div>
                <button onClick={() => setView('hackathons')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View all →</button>
              </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {hackathons.slice(0, 4).map(h => (
                    <div key={h._id} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      onClick={() => { setEditTarget(h); openEdit(h); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid #e2e8f0' }}>🏆</div>
                        <div>
                          <p style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 2px', fontSize: '15px' }}>{h.title}</p>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                            <span>📍 {h.location}</span>
                            <span>•</span>
                            <span>📅 {new Date(h.eventStartDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={h.status} />
                    </div>
                  ))}
                  {hackathons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No hackathons scheduled yet. <button onClick={openNew} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>Create one →</button></p>
                    </div>
                  )}
                </div>
              </div>
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
                            { icon: '📝', label: `Reg Open: ${new Date(h.registrationStartDate).toLocaleString()}` },
                            { icon: '⏰', label: `Reg Close: ${new Date(h.registrationDeadline).toLocaleString()}` },
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

                {/* Dates — Phase based layout */}
                {(() => {
                  const today = new Date().toISOString().slice(0, 16);
                  const regS   = form.registrationStartDate;
                  const regD   = form.registrationDeadline;
                  const startD = form.eventStartDate;
                  const endD   = form.eventEndDate;

                  const regSErr  = regS && regD && regS >= regD ? '⚠️ Must start before deadline' : null;
                  const regDErr  = regD && startD && regD >= startD ? '⚠️ Must end before event start' : null;
                  const startErr = startD && endD && startD >= endD ? '⚠️ Must start before end' : null;

                  const fieldBorder = (err) => ({ ...inputStyle, borderColor: err ? '#ef4444' : '#e2e8f0', boxShadow: err ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none' });
                  const hintStyle   = { fontSize: '11px', marginTop: '4px', fontWeight: '600', color: '#ef4444' };
                  const okStyle     = { fontSize: '11px', marginTop: '4px', fontWeight: '500', color: '#94a3b8' };

                  const handleDatePart = (field, currentVal, type, val) => {
                    const cDate = currentVal ? currentVal.split('T')[0] : '';
                    const cTime = currentVal && currentVal.includes('T') ? currentVal.split('T')[1] : '00:00';
                    if (type === 'date') setForm({ ...form, [field]: val ? `${val}T${cTime}` : '' });
                    if (type === 'time') setForm({ ...form, [field]: cDate ? `${cDate}T${val}` : '' });
                  };

                  const DateSplitField = ({ label, field, val, err, okMsg }) => (
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1.2 }}>
                          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>📅 Date</p>
                          <input required type="date" value={val ? val.split('T')[0] : ''} onChange={e => handleDatePart(field, val, 'date', e.target.value)} style={fieldBorder(err)} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div style={{ flex: 0.8 }}>
                          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>⏰ Time</p>
                          <input required type="time" value={val && val.includes('T') ? val.split('T')[1] : ''} onChange={e => handleDatePart(field, val, 'time', e.target.value)} style={fieldBorder(err)} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                      </div>
                      {err ? <p style={hintStyle}>{err}</p> : <p style={okStyle}>{okMsg}</p>}
                    </div>
                  );

                  return (
                    <div style={{ display: 'grid', gap: '24px' }}>
                      {/* Registration Phase */}
                      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>📝</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Registration Phase</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <DateSplitField label="Open For Applications" field="registrationStartDate" val={regS} err={regSErr} okMsg="When users can start joining" />
                          <DateSplitField label="Application Deadline" field="registrationDeadline" val={regD} err={regDErr} okMsg="When registrations lock" />
                        </div>
                      </div>

                      {/* Event Phase */}
                      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>🚀</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Event Phase</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <DateSplitField label="Hackathon Kick-off" field="eventStartDate" val={startD} err={null} okMsg="When hacking begins" />
                          <DateSplitField label="Final Submission" field="eventEndDate" val={endD} err={startErr} okMsg="When the event ends" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Max Teams + Prize + Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Teams</label>
                    <input type="number" min="1" max="1000" value={form.maxTeams} onChange={e => setForm({ ...form, maxTeams: parseInt(e.target.value) || 1 })} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prize Pool</label>
                    <input value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} placeholder="e.g. $10,000 in prizes" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
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
