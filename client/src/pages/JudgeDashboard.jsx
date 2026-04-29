import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const card = { background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' };

const AbstractModal = ({ team, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
    <div style={{ position: 'relative', background: 'white', borderRadius: '20px', width: '100%', maxWidth: '660px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Submission #{team.registrationRank}</p>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.3px' }}>{team.teamName}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {team.members.map((m, i) => (
                <span key={i} style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>{m}</span>
              ))}
            </div>
            {team.createdBy && (
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 2px' }}>Team Lead</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{team.createdBy.name}</p>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button onClick={onClose} style={{ width: '34px', height: '34px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#64748b', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >×</button>
            <span style={{ background: team.status === 'accepted' ? '#f0fdf4' : '#fefce8', color: team.status === 'accepted' ? '#15803d' : '#a16207', border: `1px solid ${team.status === 'accepted' ? '#bbf7d0' : '#fde68a'}`, padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
              {team.status === 'accepted' ? '✅ Accepted' : '⏳ Waitlisted'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Project Abstract</p>
        <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.85', margin: 0, whiteSpace: 'pre-wrap' }}>{team.abstract}</p>
      </div>
      <div style={{ padding: '14px 28px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
        <button onClick={onClose} style={{ padding: '9px 22px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Close</button>
      </div>
    </div>
  </div>
);

const TimelineBar = ({ hackathon }) => {
  const dates = [
    { label: 'Starts', date: hackathon.registrationStartDate, icon: '🚀' },
    { label: 'Ends', date: hackathon.registrationDeadline, icon: '🛑' },
    { label: 'Event', date: hackathon.eventStartDate, icon: '💻' },
    { label: 'Final', date: hackathon.eventEndDate, icon: '🏆' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
      {dates.map((d, i) => (
        <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid #e2e8f0' : 'none', padding: '0 4px' }}>
          <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>{d.icon} {d.label}</p>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            {d.date ? new Date(d.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}
          </p>
        </div>
      ))}
    </div>
  );
};

// Shared input style for EditTimingsModal
const timingsInputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'white', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.2s' };

// Defined at module level so React never remounts it on re-render (prevents focus loss)
const SplitField = ({ label, field, val, onDateChange, onTimeChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ flex: 1.2 }}>
        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>📅 Date</p>
        <input required type="date" value={val ? val.split('T')[0] : ''} onChange={e => onDateChange(field, val, e.target.value)} style={timingsInputStyle} />
      </div>
      <div style={{ flex: 0.8 }}>
        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>⏰ Time</p>
        <input required type="time" value={val && val.includes('T') ? val.split('T')[1] : ''} onChange={e => onTimeChange(field, val, e.target.value)} style={timingsInputStyle} />
      </div>
    </div>
  </div>
);


const EditTimingsModal = ({ hackathon, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    registrationStartDate: hackathon.registrationStartDate ? new Date(hackathon.registrationStartDate).toISOString().slice(0, 16) : '',
    registrationDeadline: hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toISOString().slice(0, 16) : '',
    eventStartDate: hackathon.eventStartDate ? new Date(hackathon.eventStartDate).toISOString().slice(0, 16) : '',
    eventEndDate: hackathon.eventEndDate ? new Date(hackathon.eventEndDate).toISOString().slice(0, 16) : ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Functional setState to avoid stale closure bugs
  const handleDateChange = (field, currentVal, val) => {
    const cTime = currentVal && currentVal.includes('T') ? currentVal.split('T')[1] : '00:00';
    setForm(prev => ({ ...prev, [field]: val ? `${val}T${cTime}` : '' }));
  };
  const handleTimeChange = (field, currentVal, val) => {
    const cDate = currentVal ? currentVal.split('T')[0] : '';
    setForm(prev => ({ ...prev, [field]: cDate ? `${cDate}T${val}` : '' }));
  };


  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await axios.put(`${API}/judge/hackathon/${hackathon._id}/timings`, form);
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update timings.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Edit Event Timings</h3>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>{hackathon.title}</p>
        </div>
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>⚠️ {error}</div>}
          
          <SplitField label="Registration Start Time" field="registrationStartDate" val={form.registrationStartDate} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />
          <SplitField label="Registration Deadline" field="registrationDeadline" val={form.registrationDeadline} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />
          <SplitField label="Event Start Time" field="eventStartDate" val={form.eventStartDate} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />
          <SplitField label="Event End Time" field="eventEndDate" val={form.eventEndDate} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#cbd5e1' : '#0891b2', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {saving ? '⏳ Saving...' : '✅ Save Timings'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '12px 20px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function JudgeDashboard() {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('active'); // 'active' or 'history'
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [editingTimings, setEditingTimings] = useState(false);
  const [filterCollege, setFilterCollege] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const [pRole, setPRole] = useState('all');

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = () => {
    setLoading(true);
    axios.get(`${API}/judge/hackathons`)
      .then(r => setHackathons(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleJoin = async (id) => {
    setJoiningId(id);
    try {
      await axios.post(`${API}/judge/hackathon/${id}/join`);
      fetchHackathons();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to join hackathon');
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (id) => {
    if (!window.confirm('Are you sure you want to unregister from judging this event?')) return;
    try {
      await axios.post(`${API}/judge/hackathon/${id}/leave`);
      fetchHackathons();
      alert('Unregistered successfully.');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to leave hackathon');
    }
  };

  const canReview = (h) => {
    const isJoined = h.judges?.some(j => {
      const jId = j?._id || j;
      const uId = user?.id || user?._id;
      return jId?.toString() === uId?.toString();
    });
    const deadlinePassed = new Date() >= new Date(h.registrationDeadline);
    return isJoined && deadlinePassed;
  };

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const r = await axios.get(`${API}/judge/teams`, { 
        params: { 
          page, 
          limit: 10, 
          search, 
          hackathonId: selectedHackathon._id,
          college: filterCollege,
          city: filterCity
        } 
      });
      setTeams(r.data.teams); setTotalPages(r.data.totalPages); setTotal(r.data.totalTeams);
    } catch (e) { console.error(e); }
    finally { setTeamsLoading(false); }
  };

  useEffect(() => {
    if (selectedHackathon) fetchTeams();
  }, [page, search, selectedHackathon, filterCollege, filterCity]);


  const now = new Date();
  const registeredActive = hackathons.filter(h => {
    const isJoined = h.judges?.some(j => {
      const jId = j?._id || j;
      const uId = user?.id || user?._id;
      return jId?.toString() === uId?.toString();
    });
    return isJoined && new Date(h.eventEndDate) > now;
  });

  const availableToJoin = hackathons.filter(h => {
    const isJoined = h.judges?.some(j => {
      const jId = j?._id || j;
      const uId = user?.id || user?._id;
      return jId?.toString() === uId?.toString();
    });
    return !isJoined && new Date(h.eventEndDate) > now;
  });

  const judgingHistory = hackathons.filter(h => {
    const isJoined = h.judges?.some(j => {
      const jId = j?._id || j;
      const uId = user?.id || user?._id;
      return jId?.toString() === uId?.toString();
    });
    return isJoined && new Date(h.eventEndDate) <= now;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0891b2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#64748b', fontWeight: '500', margin: 0 }}>Loading hackathons...</p>
    </div>
  );

  return (
    <div style={{ width: '100%', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ background: '#ecfeff', color: '#0891b2', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em' }}>⚖️ Judge Panel</span>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
          Welcome, {user?.name || 'Judge'}!
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
          {selectedHackathon ? `Judging: ${selectedHackathon.title}` : 'Manage your judging events and review abstracts.'}
        </p>
      </div>

      {/* Internal Navigation Tabs */}
      {!selectedHackathon && (
        <div style={{ display: 'flex', gap: '16px', background: 'white', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <button onClick={() => setView('active')}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === 'active' ? '800' : '600', background: view === 'active' ? 'linear-gradient(135deg, #0891b2, #06b6d4)' : 'transparent', color: view === 'active' ? 'white' : '#64748b', transition: 'all 0.2s', boxShadow: view === 'active' ? '0 2px 8px rgba(8,145,178,0.3)' : 'none' }}
          >🔥 Active & Available</button>
          <button onClick={() => setView('history')}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === 'history' ? '800' : '600', background: view === 'history' ? '#f1f5f9' : 'transparent', color: view === 'history' ? '#475569' : '#64748b', transition: 'all 0.2s' }}
          >⌛ Judging History</button>
        </div>
      )}

      {/* Main Content Area */}
      {!selectedHackathon ? (
        <div>
          {/* ── SECTION: Registered Hackathons (Active) ── */}
          {view === 'active' && registeredActive.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Registered for Judging</h2>
                <span style={{ background: '#ecfeff', color: '#0891b2', padding: '2px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>{registeredActive.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {registeredActive.map(h => (
                  <div key={h._id} style={{ ...card, padding: '24px', transition: 'all 0.2s', borderLeft: `6px solid #0891b2` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{h.title}</h3>
                          <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', border: '1px solid #bbf7d0' }}>✅ REGISTERED</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                          <span>📅 Starts: {new Date(h.eventStartDate).toLocaleDateString()}</span>
                          <span>🏆 Ends: {new Date(h.eventEndDate).toLocaleDateString()}</span>
                          <span>📍 {h.location}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleLeave(h._id)}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        >✕ Unregister</button>
                        {!canReview(h) ? (
                          <div style={{ textAlign: 'right', padding: '10px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>LOCKED</p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Opens after {h.registrationDeadline ? new Date(h.registrationDeadline).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setSelectedHackathon(h); setPage(1); setSearch(''); }}
                            style={{ background: '#0891b2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(8,145,178,0.2)' }}
                          >View Submissions →</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION: Available to Join ── */}
          {view === 'active' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Available to Judge</h2>
                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>{availableToJoin.length}</span>
              </div>
              {availableToJoin.length === 0 ? (
                <div style={{ ...card, padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
                  <p style={{ color: '#64748b', margin: 0, fontWeight: '600' }}>No new hackathons available for judging at this time.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {availableToJoin.map(h => (
                    <div key={h._id} style={{ ...card, padding: '28px', borderLeft: '6px solid #e2e8f0', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(8,145,178,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{h.title}</h3>
                            <span style={{ background: '#ecfeff', color: '#0891b2', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Available</span>
                          </div>
                          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px', lineHeight: '1.7', maxWidth: '800px' }}>{h.description}</p>
                          <TimelineBar hackathon={h} />
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                             <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>📍 {h.location}</span>
                             <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>💻 {h.mode.toUpperCase()}</span>
                             {h.prizePool && <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '800' }}>🏅 {h.prizePool}</span>}
                          </div>
                        </div>
                        <button 
                          disabled={joiningId === h._id}
                          onClick={() => handleJoin(h._id)}
                          style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: joiningId === h._id ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(8,145,178,0.3)', transition: 'all 0.2s' }}
                          onMouseEnter={e => { if (joiningId !== h._id) e.target.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                          {joiningId === h._id ? '⏳ Joining...' : 'Join as Judge →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SECTION: Judging History (Past) ── */}
          {view === 'history' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Judging History</h2>
                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>{judgingHistory.length}</span>
              </div>
              {judgingHistory.length === 0 ? (
                <div style={{ ...card, padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
                  <p style={{ color: '#64748b', margin: 0, fontWeight: '600' }}>You haven't judges any past events yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {judgingHistory.map(h => (
                    <div key={h._id} style={{ ...card, padding: '24px', borderLeft: '6px solid #94a3b8', background: '#f8fafc', opacity: 0.9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#334155', margin: '0 0 6px' }}>{h.title}</h3>
                          <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px', fontWeight: '700' }}>CONCLUDED {new Date(h.eventEndDate).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => { setSelectedHackathon(h); setPage(1); setSearch(''); }}
                          style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >Review Submissions</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* ── ABSTRACTS VIEW ── */
        <div>
          <div style={{ ...card, padding: '16px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Reviewing</p>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px' }}>{selectedHackathon.title}</h2>
              <TimelineBar hackathon={selectedHackathon} />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setEditingTimings(true)}
                style={{ padding: '8px 16px', border: '1px solid #a5f3fc', borderRadius: '100px', background: '#ecfeff', color: '#0891b2', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ✏️ Edit Event Timings
              </button>
              <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>
                {total} submission{total !== 1 ? 's' : ''}
              </div>
              <button onClick={() => { setSelectedHackathon(null); setTeams([]); }}
                style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ← Back to Dashboard
              </button>
            </div>
          </div>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search team name..."
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'white', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#0891b2'; e.target.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

          <div style={card}>
            {teamsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#0891b2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Loading...</p>
              </div>
            ) : teams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>No submissions yet</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Participants haven't registered for this hackathon yet.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '52px 1.5fr 1fr 110px 130px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                  {['#', 'Team', 'Members', 'Status', 'Abstract'].map(h => (
                    <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                  ))}
                </div>

                {teams.map((team, i) => (
                  <div key={team._id}
                    style={{ display: 'grid', gridTemplateColumns: '52px 1.5fr 1fr 110px 130px', padding: '16px 20px', borderBottom: i < teams.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: team.registrationRank === 1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : team.registrationRank <= 3 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: team.registrationRank <= 3 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                      {team.registrationRank}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 2px', fontSize: '14px' }}>{team.teamName}</p>
                      {team.createdBy?.name && <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: '500' }}>by {team.createdBy.name}</p>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {team.members.map((m, j) => (
                        <span key={j} style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{m}</span>
                      ))}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: team.status === 'accepted' ? '#f0fdf4' : '#fefce8', color: team.status === 'accepted' ? '#15803d' : '#a16207', border: `1px solid ${team.status === 'accepted' ? '#bbf7d0' : '#fde68a'}`, padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {team.status === 'accepted' ? '✅ Accepted' : '⏳ Waitlist'}
                    </span>
                    <button onClick={() => setSelected(team)}
                      style={{ background: '#eef2ff', color: '#6366f1', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                    >Read Abstract</button>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Page <strong style={{ color: '#0f172a' }}>{page}</strong> of <strong style={{ color: '#0f172a' }}>{totalPages}</strong></p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[['← Prev', () => setPage(p => Math.max(p - 1, 1)), page === 1], ['Next →', () => setPage(p => Math.min(p + 1, totalPages)), page === totalPages]].map(([lbl, fn, dis]) => (
                        <button key={lbl} onClick={fn} disabled={dis}
                          style={{ padding: '7px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: dis ? '#f8fafc' : 'white', color: dis ? '#cbd5e1' : '#475569', fontSize: '13px', fontWeight: '600', cursor: dis ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >{lbl}</button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {selected && <AbstractModal team={selected} onClose={() => setSelected(null)} />}
      {editingTimings && (
        <EditTimingsModal 
          hackathon={selectedHackathon} 
          onClose={() => setEditingTimings(false)} 
          onSuccess={(updatedHackathon) => {
            setSelectedHackathon(updatedHackathon);
            setHackathons(hackathons.map(h => h._id === updatedHackathon._id ? updatedHackathon : h));
            setEditingTimings(false);
          }} 
        />
      )}
    </div>
  );
}
