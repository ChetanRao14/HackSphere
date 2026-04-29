import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const card = { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' };
const label = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' };
const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.2s', background: 'white', color: '#1e293b', boxSizing: 'border-box' };
const focusIn = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; };
const focusOut = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

const StatusBadge = ({ status, rank, maxTeams }) => {
  if (status === 'accepted') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#15803d', border: '1.5px solid #bbf7d0', padding: '5px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px' }}>
        ✅ Accepted — Spot #{rank}
      </span>
      <span style={{ fontSize: '11px', color: '#64748b' }}>You secured a spot! ({rank}/{maxTeams})</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fefce8', color: '#a16207', border: '1.5px solid #fde68a', padding: '5px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px' }}>
        ⏳ Waitlisted — #{rank}
      </span>
      <span style={{ fontSize: '11px', color: '#64748b' }}>Hackathon is full. You're #{rank} on the waitlist.</span>
    </div>
  );
};

export default function ParticipantDashboard() {
  const [view, setView] = useState('active');
  const [hackathons, setHackathons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [members, setMembers] = useState(['']);
  const [form, setForm] = useState({ teamName: '', abstract: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [hackRes, teamRes] = await Promise.allSettled([
        axios.get(`${API}/hackathons`),
        axios.get(`${API}/team/my`)
      ]);
      if (hackRes.status === 'fulfilled') setHackathons(hackRes.value.data);
      if (teamRes.status === 'fulfilled') setTeams(teamRes.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const r = await axios.post(`${API}/team/create`, {
        ...form,
        members: members.filter(m => m.trim()),
        hackathonId: selectedHackathon._id
      });
      setTeams([r.data, ...teams]);
      setSelectedHackathon(null);
      setForm({ teamName: '', abstract: '' });
      setMembers(['']);
      window.scrollTo(0, 0);
    } catch (e) { setError(e.response?.data?.message || 'Submission failed.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#64748b', fontWeight: '500', margin: 0 }}>Loading your dashboard...</p>
    </div>
  );

  const registeredHackathonIds = teams.map(t =>
    typeof t.hackathon === 'object' ? t.hackathon?._id?.toString() : t.hackathon?.toString()
  );
  const availableHackathons = hackathons.filter(h => !registeredHackathonIds.includes(h._id.toString()));

  // Split registrations into Current vs Past
  const now = new Date();
  const currentRegistrations = teams.filter(t => t.hackathon && new Date(t.hackathon.eventEndDate) > now);
  const pastRegistrations    = teams.filter(t => t.hackathon && new Date(t.hackathon.eventEndDate) <= now);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel your registration? This will permanently delete your team and abstract.')) return;
    try {
      await axios.delete(`${API}/team/${id}`);
      setTeams(teams.filter(t => t._id !== id));
      alert('Registration cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration.');
    }
  };

  // eslint-disable-next-line react/display-name
  const TimelineBar = ({ hackathon }) => {
    const dates = [
      { label: 'Register', date: hackathon.registrationStartDate, icon: '🚀' },
      { label: 'Deadline', date: hackathon.registrationDeadline, icon: '🛑' },
      { label: 'Event', date: hackathon.eventStartDate, icon: '💻' },
      { label: 'Ends', date: hackathon.eventEndDate, icon: '🏆' }
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        {dates.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid #e2e8f0' : 'none', padding: '0 4px' }}>
            <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{d.icon} {d.label}</p>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              {d.date ? new Date(d.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const TeamCard = ({ team, isPast = false }) => {
    const isCancelable = team.hackathon ? new Date() < new Date(team.hackathon.registrationDeadline) : false;

    return (
      <div style={{ ...card, padding: '28px', borderLeft: `6px solid ${isPast ? '#94a3b8' : '#6366f1'}`, opacity: isPast ? 0.8 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
              {team.hackathon?.title} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span> <span style={{ color: '#0891b2' }}>Registered {new Date(team.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>{team.teamName}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {team.members.map((m, i) => (
                <span key={i} style={{ background: '#f5f3ff', color: '#6366f1', border: '1px solid #ddd6fe', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
                  👤 {m}
                </span>
              ))}
            </div>
          </div>
          {!isPast && isCancelable && (
            <button onClick={() => handleCancel(team._id)}
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
            >
              ✕ Cancel Registration
            </button>
          )}
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📝</span> Project Abstract
          </p>
          <p style={{ color: '#334155', fontSize: '15px', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>{team.abstract}</p>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>💻 Event Starts</span>
            <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
              {team.hackathon?.eventStartDate ? new Date(team.hackathon.eventStartDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}
            </span>
          </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>🏆 Event Ends</span>
          <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
            {team.hackathon?.eventEndDate ? new Date(team.hackathon.eventEndDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>📍 Venue</span>
          <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{team.hackathon?.location || 'TBD'}</span>
        </div>
      </div>
    </div>
  );
};

  return (
    <div style={{ width: '100%', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em' }}>🎓 Participant Portal</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
            Welcome, {user.name || 'Participant'}!
          </h1>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</div>}

      {/* ── INTERNAL NAVIGATION ── */}
      {!selectedHackathon && (
        <div style={{ display: 'flex', gap: '16px', background: 'white', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
          <button onClick={() => setView('active')}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === 'active' ? '800' : '600', background: view === 'active' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent', color: view === 'active' ? 'white' : '#64748b', transition: 'all 0.2s', boxShadow: view === 'active' ? '0 2px 8px rgba(99,102,241,0.3)' : 'none' }}
          >🔥 Active & Available</button>
          <button onClick={() => setView('history')}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: view === 'history' ? '800' : '600', background: view === 'history' ? '#f1f5f9' : 'transparent', color: view === 'history' ? '#475569' : '#64748b', transition: 'all 0.2s' }}
          >⌛ Registration History</button>
        </div>
      )}

      {/* ── CURRENT REGISTRATIONS ── */}
      {view === 'active' && currentRegistrations.length > 0 && !selectedHackathon && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Current Registrations</h2>
            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>{currentRegistrations.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {currentRegistrations.map(team => <TeamCard key={team._id} team={team} />)}
          </div>
        </div>
      )}

      {/* ── PREVIOUS HACKATHONS ── */}
      {view === 'history' && !selectedHackathon && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#64748b', margin: 0 }}>Previous Hackathons</h2>
            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>{pastRegistrations.length}</span>
          </div>
          {pastRegistrations.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>⌛</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>No previous history</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>You haven't participated in any completed hackathons yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pastRegistrations.map(team => <TeamCard key={team._id} team={team} isPast />)}
            </div>
          )}
        </div>
      )}

      {/* ── AVAILABLE HACKATHONS ── */}
      {view === 'active' && !selectedHackathon && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🔥 Available Hackathons</h2>
            <span style={{ background: '#ecfeff', color: '#0891b2', padding: '2px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>{availableHackathons.length}</span>
          </div>

          {availableHackathons.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '60px 40px', background: '#f8fafc' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>No new hackathons available</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>You've either registered for all upcoming events, or none are currently scheduled by the admin.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {availableHackathons.map(h => (
                <div key={h._id} style={{ ...card, padding: '28px', transition: 'all 0.2s', borderLeft: `6px solid ${h.status === 'announcement' ? '#e2e8f0' : '#8b5cf6'}`, background: 'white' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99,102,241,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{h.title}</h3>
                        <span style={{ background: h.mode === 'online' ? '#ecfeff' : '#f0fdf4', color: h.mode === 'online' ? '#0891b2' : '#15803d', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                          {h.mode === 'in-person' ? '🏢 In-Person' : h.mode === 'online' ? '💻 Online' : '🔀 Hybrid'}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px', lineHeight: '1.7', maxWidth: '800px' }}>{h.description}</p>
                      
                      <TimelineBar hackathon={h} />

                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {h.location}</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>👥 Max {h.maxTeams} Teams</span>
                        {h.prizePool && <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>🏅 {h.prizePool}</span>}
                      </div>
                    </div>
                    
                    <div style={{ flexShrink: 0 }}>
                      <button 
                        onClick={() => setSelectedHackathon(h)}
                        disabled={h.status === 'announcement'}
                        style={{ 
                          background: h.status === 'announcement' ? '#f1f5f9' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                          color: h.status === 'announcement' ? '#94a3b8' : 'white', 
                          border: 'none', 
                          padding: '14px 28px', 
                          borderRadius: '12px', 
                          fontWeight: '800', 
                          fontSize: '15px', 
                          cursor: h.status === 'announcement' ? 'not-allowed' : 'pointer', 
                          fontFamily: 'Inter, sans-serif', 
                          boxShadow: h.status === 'announcement' ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {h.status === 'announcement' ? '🔜 Opening Soon' : 'Join Hackathon →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* ── STEP 2: Register Team ── */}
      {selectedHackathon && (
        <div>
          <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Step 2 — Register Your Team</p>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white', margin: 0 }}>{selectedHackathon.title}</h2>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#fee2e2', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                    ⏳ Register by: {new Date(selectedHackathon.registrationDeadline).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>📅 Event: {new Date(selectedHackathon.eventStartDate).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>📍 {selectedHackathon.location}</span>
                </div>
              </div>
              <button onClick={() => setSelectedHackathon(null)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '7px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ← Change
              </button>
            </div>
          </div>

          <div style={card}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Team Name */}
              <div>
                <label style={label}>Team Name *</label>
                <input required value={form.teamName} onChange={e => setForm({ ...form, teamName: e.target.value })} placeholder="e.g. Code Ninjas" style={{ ...inputStyle, fontSize: '16px', padding: '13px 16px' }} onFocus={focusIn} onBlur={focusOut} />
              </div>

              {/* Members */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ ...label, margin: 0 }}>Team Members * <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: '500', fontSize: '11px' }}>({members.length}/4)</span></label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {members.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                      <input required value={m} onChange={e => { const nm = [...members]; nm[i] = e.target.value; setMembers(nm); }} placeholder={`Member ${i + 1} full name`} style={{ ...inputStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                      {members.length > 1 && (
                        <button type="button" onClick={() => setMembers(members.filter((_, j) => j !== i))}
                          style={{ width: '34px', height: '34px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
                {members.length < 4 && (
                  <button type="button" onClick={() => setMembers([...members, ''])}
                    style={{ marginTop: '10px', background: '#eef2ff', border: '1px dashed #a5b4fc', color: '#6366f1', padding: '9px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#eef2ff'}
                  >+ Add Member</button>
                )}
              </div>

              {/* Abstract */}
              <div>
                <label style={label}>Project Abstract * <span style={{ color: '#94a3b8', fontWeight: '500', textTransform: 'none', fontSize: '11px' }}>max 2,000 chars</span></label>
                <textarea required maxLength={2000} rows={6} value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })}
                  placeholder="Describe your idea, technology, and what problem you're solving..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.7' }} onFocus={focusIn} onBlur={focusOut}
                />
                <p style={{ textAlign: 'right', fontSize: '12px', color: form.abstract.length > 1800 ? '#ef4444' : '#94a3b8', fontWeight: '600', margin: '4px 0 0' }}>{form.abstract.length.toLocaleString()} / 2,000</p>
              </div>

              {/* Slots info */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <p style={{ color: '#15803d', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                  First <strong>{selectedHackathon.maxTeams}</strong> teams to register are automatically accepted. Register now to secure your spot!
                </p>
              </div>

              <button type="submit" disabled={submitting}
                style={{ padding: '14px', borderRadius: '12px', border: 'none', background: submitting ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '15px', fontWeight: '800', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 15px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!submitting) e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                {submitting ? '⏳ Submitting...' : '🚀 Submit Team Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
