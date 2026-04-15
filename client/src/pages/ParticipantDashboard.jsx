import React, { useState, useEffect } from 'react';
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
  const [hackathons, setHackathons] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [members, setMembers] = useState(['']);
  const [form, setForm] = useState({ teamName: '', abstract: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [hackRes, teamRes] = await Promise.allSettled([
        axios.get(`${API}/hackathons`),
        axios.get(`${API}/team/my`)
      ]);
      if (hackRes.status === 'fulfilled') setHackathons(hackRes.value.data);
      if (teamRes.status === 'fulfilled') setTeam(teamRes.value.data);
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
      setTeam(r.data);
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

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em' }}>🎓 Participant Portal</span>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
          {team ? team.teamName : 'Hackathon Registration'}
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
          {team ? 'Your submission is confirmed below.' : 'Choose a hackathon and register your team.'}
        </p>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</div>}

      {/* ── ALREADY REGISTERED ── */}
      {team ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Status banner */}
          <div style={{ ...card, borderLeft: `5px solid ${team.status === 'accepted' ? '#22c55e' : '#f59e0b'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                {team.hackathon?.title || 'Hackathon'}
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.3px' }}>{team.teamName}</h2>
              <StatusBadge status={team.status} rank={team.registrationRank} maxTeams={team.hackathon?.maxTeams || '?'} />
            </div>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '180px' }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>⏰ Registration Closes</p>
                <div style={{ display: 'inline-block', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                  {new Date(team.hackathon?.registrationDeadline).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>📅 Event date</p>
                <p style={{ fontSize: '13px', color: '#334155', fontWeight: '700', margin: 0 }}>
                  {new Date(team.hackathon?.eventStartDate).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>📍 Venue</p>
                <p style={{ fontSize: '13px', color: '#334155', fontWeight: '700', margin: 0 }}>{team.hackathon?.location}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            {/* Members */}
            <div style={card}>
              <p style={{ ...label, marginBottom: '14px' }}>👥 Team Members</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {team.members.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', borderRadius: '8px', padding: '9px 12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.charAt(0).toUpperCase()}</div>
                    <span style={{ color: '#334155', fontWeight: '600', fontSize: '14px' }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Details */}
            <div style={card}>
              <p style={{ ...label, marginBottom: '14px' }}>📊 Submission Info</p>
              {[
                ['Team Size',    `${team.members.length} member${team.members.length !== 1 ? 's' : ''}`],
                ['Submitted',    new Date(team.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })],
                ['Abstract',     `${team.abstract.length} / 2,000 chars`],
                ['Registration', `#${team.registrationRank}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{k}</span>
                  <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Abstract */}
          <div style={card}>
            <p style={{ ...label, marginBottom: '12px' }}>📝 Project Abstract</p>
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#334155', fontSize: '15px', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>{team.abstract}</p>
            </div>
          </div>
        </div>
      ) : (
        /* ── STEP 1: Pick Hackathon ── */
        !selectedHackathon ? (
          <div>
            <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: '0 0 6px' }}>Step 1 — Choose a Hackathon</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '14px' }}>Select the event you'd like to participate in.</p>
            </div>
            {hackathons.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏆</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>No open hackathons yet</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Check back soon — the admin will schedule events shortly.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {hackathons.map(h => (
                  <div key={h._id} style={{ ...card, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
                    onClick={() => setSelectedHackathon(h)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{h.title}</h3>
                        <span style={{ background: h.mode === 'online' ? '#ecfeff' : '#f0fdf4', color: h.mode === 'online' ? '#0891b2' : '#15803d', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                          {h.mode === 'in-person' ? '🏢 In-Person' : h.mode === 'online' ? '💻 Online' : '🔀 Hybrid'}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.6' }}>{h.description.length > 120 ? h.description.slice(0, 120) + '...' : h.description}</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                          ⏳ Deadline: {new Date(h.registrationDeadline).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>📅 {new Date(h.eventStartDate).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>📍 {h.location}</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>👥 Max {h.maxTeams} teams</span>
                        {h.prizePool && <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>🏅 {h.prizePool}</span>}
                      </div>
                      {h.tags?.length > 0 && <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {h.tags.map((t, i) => <span key={i} style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>#{t}</span>)}
                      </div>}
                    </div>
                    <button style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,0.3)', whiteSpace: 'nowrap' }}>
                      Register →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── STEP 2: Register Team ── */
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
        )
      )}
    </div>
  );
}
