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

// Shared styles used by AdminDateSplitField (module-level to avoid recreation)
const adminInputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'white', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.2s' };
const adminFocusIn  = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; };
const adminFocusOut = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

// Module-level so React never remounts it on re-render — prevents date input focus loss
const AdminDateSplitField = ({ label, field, val, err, okMsg, setForm }) => {
  const fieldBorder = { ...adminInputStyle, borderColor: err ? '#ef4444' : '#e2e8f0', boxShadow: err ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none' };
  const handleDate = (e) => {
    const cTime = val && val.includes('T') ? val.split('T')[1] : '00:00';
    setForm(prev => ({ ...prev, [field]: e.target.value ? `${e.target.value}T${cTime}` : '' }));
  };
  const handleTime = (e) => {
    const cDate = val ? val.split('T')[0] : '';
    setForm(prev => ({ ...prev, [field]: cDate ? `${cDate}T${e.target.value}` : '' }));
  };
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1.2 }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>📅 Date</p>
          <input required type="date" value={val ? val.split('T')[0] : ''} onChange={handleDate} style={fieldBorder} onFocus={adminFocusIn} onBlur={adminFocusOut} />
        </div>
        <div style={{ flex: 0.8 }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>⏰ Time</p>
          <input required type="time" value={val && val.includes('T') ? val.split('T')[1] : ''} onChange={handleTime} style={fieldBorder} onFocus={adminFocusIn} onBlur={adminFocusOut} />
        </div>
      </div>
      {err ? <p style={{ fontSize: '11px', marginTop: '4px', fontWeight: '600', color: '#ef4444' }}>{err}</p>
           : <p style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500', color: '#94a3b8' }}>{okMsg}</p>}
    </div>
  );
};


const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'active' | 'completed' | 'new' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User Directory State
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [pSearch, setPSearch] = useState('');
  const [pRole, setPRole] = useState('all');
  const [pHackathonId, setPHackathonId] = useState('');
  const [pCollege, setPCollege] = useState('');
  const [pPlace, setPPlace] = useState('');

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

  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    setError('');
    try {
      const testRes = await axios.get(`${API}/admin/test-route`);
      console.log('Test Route Result:', testRes.data);
      
      console.log('Fetching users from:', `${API}/admin/user-directory`);
      const res = await axios.get(`${API}/admin/user-directory`, {
        params: { search: pSearch, role: pRole, hackathonId: pHackathonId, college: pCollege, place: pPlace }
      });
      console.log('User Directory response:', res.data);
      const data = Array.isArray(res.data) ? res.data : [];
      setParticipants(data);
    } catch (e) { 
      console.error('Fetch Directory Error:', e);
      setError(`Failed to load user directory: ${e.response?.data?.message || e.message}`);
    }
    finally { setParticipantsLoading(false); }
  };

  useEffect(() => {
    if (view === 'participants') fetchParticipants();
  }, [view, pSearch, pRole, pHackathonId, pCollege, pPlace]);


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
      setView('active');
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
    { key: 'active', icon: '🔥', label: 'Active & Upcoming' },
    { key: 'completed', icon: '⌛', label: 'Completed' },
    { key: 'participants', icon: '👥', label: 'User Directory' },
  ];

  const activeHackathons    = hackathons.filter(h => new Date(h.eventEndDate) >= new Date());
  const completedHackathons = hackathons.filter(h => new Date(h.eventEndDate) < new Date());

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#64748b', fontSize: '15px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🏛️ {user?.college || 'No Org'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {user?.place || 'No Place'}</span>
        </div>
      </div>

      {/* ── HORIZONTAL ADMIN PANEL ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', background: 'white', borderRadius: '16px', padding: '16px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 12px 0 0' }}>Admin Panel</p>
        
        {sideItems.map(item => (
          <button key={item.key} onClick={() => { 
            if (item.key === 'participants') setPHackathonId(''); 
            setView(item.key); 
          }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === item.key ? '700' : '600', transition: 'all 0.15s', background: view === item.key ? '#eef2ff' : 'transparent', color: view === item.key ? '#6366f1' : '#64748b' }}
          ><span>{item.icon}</span>{item.label}</button>
        ))}

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />

        <button onClick={openNew}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '700', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
        ><span>➕</span> New Hackathon</button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ width: '100%' }}>
        {success && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>✅ {success}</div>}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>❌ {error}</div>}

        {/* ── OVERVIEW ── */}
        {view === 'dashboard' && stats && (
          <div style={{ display: 'grid', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <StatCard icon="🏆" label="Hackathons" value={stats.totalHackathons} color="#eef2ff" />
              <StatCard icon="👥" label="Total Teams" value={stats.totalTeams} color="#f0fdf4" />
              <StatCard icon="🎓" label="Participants" value={stats.totalParticipants} color="#fffbeb" />
              <StatCard icon="⚖️" label="Judges" value={stats.totalJudges} color="#ecfeff" />
              <StatCard icon="👑" label="Admins" value={stats.totalAdmins} color="#fef2f2" />
            </div>

            {/* Quick Summary Section */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 24px' }}>Platform Activity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div style={{ borderLeft: '4px solid #6366f1', paddingLeft: '20px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px', fontWeight: '600' }}>Active Hackathons</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{activeHackathons.length}</p>
                </div>
                <div style={{ borderLeft: '4px solid #94a3b8', paddingLeft: '20px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px', fontWeight: '600' }}>Concluded Events</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{completedHackathons.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVE & UPCOMING ── */}
        {view === 'active' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Active & Upcoming</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{activeHackathons.length} current or future event{activeHackathons.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={openNew}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >➕ Schedule New</button>
            </div>

            {activeHackathons.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🚀</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>No active hackathons</h3>
                <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: '14px' }}>Schedule your first hackathon to get started.</p>
                <button onClick={openNew} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Create Hackathon</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeHackathons.map(h => (
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
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setPHackathonId(h._id); setView('participants'); }}
                          style={{ flex: 1, background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                        >👥 Users</button>
                        <button onClick={() => openEdit(h)}
                          style={{ flex: 1, background: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0', padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                        >✏️ Edit</button>
                        <button onClick={() => handleDelete(h._id)}
                          style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '9px 12px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        >🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}




        {/* ── COMPLETED ── */}
        {view === 'completed' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Completed Hackathons</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{completedHackathons.length} concluded event{completedHackathons.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {completedHackathons.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>⌛</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>No completed hackathons</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Past events will appear here once they conclude.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {completedHackathons.map(h => (
                  <div key={h._id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1.5px solid #e2e8f0', opacity: 0.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#334155', margin: 0 }}>{h.title}</h3>
                          <span style={{ background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e2e8f0', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>CONCLUDED</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px' }}>{h.description.length > 150 ? h.description.slice(0, 150) + '...' : h.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                           <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>📍 {h.location}</span>
                           <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>📅 Finished: {new Date(h.eventEndDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setPHackathonId(h._id); setView('participants'); }}
                          style={{ background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >👥 Users</button>
                        <button onClick={() => openEdit(h)}
                          style={{ background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >Review</button>
                        <button onClick={() => handleDelete(h._id)}
                          style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                        >Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USER DIRECTORY ── */}
        {view === 'participants' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>User Directory</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                {pHackathonId 
                  ? `Viewing users registered for: ${hackathons.find(h => h._id === pHackathonId)?.title || 'Selected Event'}` 
                  : 'Manage and filter all platform users'}
              </p>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Search Name</label>
                <input value={pSearch} onChange={e => setPSearch(e.target.value)} placeholder="e.g. John Doe" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div style={{ width: '160px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                <select value={pRole} onChange={e => setPRole(e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                  <option value="all">All Roles</option>
                  <option value="participant">Participants</option>
                  <option value="judge">Judges</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Filter By Hackathon</label>
                <select value={pHackathonId} onChange={e => setPHackathonId(e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                  <option value="">All Events</option>
                  {hackathons.map(h => <option key={h._id} value={h._id}>{h.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>College</label>
                <input value={pCollege} onChange={e => setPCollege(e.target.value)} placeholder="e.g. Stanford" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Place</label>
                <input value={pPlace} onChange={e => setPPlace(e.target.value)} placeholder="e.g. California" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {/* Results Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: '700', color: '#64748b' }}>NAME</th>
                    <th style={{ padding: '16px 24px', fontWeight: '700', color: '#64748b' }}>EMAIL</th>
                    <th style={{ padding: '16px 24px', fontWeight: '700', color: '#64748b' }}>ROLE</th>
                    <th style={{ padding: '16px 24px', fontWeight: '700', color: '#64748b' }}>COLLEGE</th>
                    <th style={{ padding: '16px 24px', fontWeight: '700', color: '#64748b' }}>PLACE</th>
                    <th style={{ padding: '16px 24px', fontWeight: '700', color: '#64748b' }}>JOINED</th>
                  </tr>
                </thead>
                <tbody>
                  {participantsLoading && (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                         <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.6s linear infinite', verticalAlign: 'middle', marginRight: '10px' }} />
                         Loading users...
                      </td>
                    </tr>
                  )}
                  {!participantsLoading && participants.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a' }}>{p.name}</td>
                      <td style={{ padding: '16px 24px', color: '#64748b' }}>{p.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                          background: p.role === 'admin' ? '#fef2f2' : p.role === 'judge' ? '#ecfeff' : '#f0fdf4',
                          color: p.role === 'admin' ? '#dc2626' : p.role === 'judge' ? '#0891b2' : '#16a34a'
                        }}>{p.role}</span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#64748b' }}>{p.college || '-'}</td>
                      <td style={{ padding: '16px 24px', color: '#64748b' }}>{p.place || '-'}</td>
                      <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {participants.length === 0 && !participantsLoading && (
                    <tr>
                      <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>No users found matching these filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT FORM ── */}
        {(view === 'new' || view === 'edit') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <button onClick={() => setView('active')} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>←</button>
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
                  const regS   = form.registrationStartDate;
                  const regD   = form.registrationDeadline;
                  const startD = form.eventStartDate;
                  const endD   = form.eventEndDate;
                  const regSErr  = regS && regD && regS >= regD ? '⚠️ Must start before deadline' : null;
                  const regDErr  = regD && startD && regD >= startD ? '⚠️ Must end before event start' : null;
                  const startErr = startD && endD && startD >= endD ? '⚠️ Must start before end' : null;
                  return (
                    <div style={{ display: 'grid', gap: '24px' }}>
                      {/* Registration Phase */}
                      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>📝</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Registration Phase</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <AdminDateSplitField label="Open For Applications" field="registrationStartDate" val={regS} err={regSErr} okMsg="When users can start joining" setForm={setForm} />
                          <AdminDateSplitField label="Application Deadline" field="registrationDeadline" val={regD} err={regDErr} okMsg="When registrations lock" setForm={setForm} />
                        </div>
                      </div>
                      {/* Event Phase */}
                      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>🚀</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Event Phase</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <AdminDateSplitField label="Hackathon Kick-off" field="eventStartDate" val={startD} err={null} okMsg="When hacking begins" setForm={setForm} />
                          <AdminDateSplitField label="Final Submission" field="eventEndDate" val={endD} err={startErr} okMsg="When the event ends" setForm={setForm} />
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
                  <button type="button" onClick={() => setView('active')}
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
