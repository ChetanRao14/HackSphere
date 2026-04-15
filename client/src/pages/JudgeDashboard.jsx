import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {team.members.map((m, i) => (
                <span key={i} style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>{m}</span>
              ))}
            </div>
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

export default function JudgeDashboard() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}/hackathons`).then(r => setHackathons(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedHackathon) fetchTeams();
  }, [page, search, selectedHackathon]);

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const r = await axios.get(`${API}/judge/teams`, { params: { page, limit: 10, search, hackathonId: selectedHackathon._id } });
      setTeams(r.data.teams); setTotalPages(r.data.totalPages); setTotal(r.data.totalTeams);
    } catch (e) { console.error(e); }
    finally { setTeamsLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0891b2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#64748b', fontWeight: '500', margin: 0 }}>Loading hackathons...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ background: '#ecfeff', color: '#0891b2', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em' }}>⚖️ Judge Panel</span>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '12px 0 6px', letterSpacing: '-0.5px' }}>Review Abstracts</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
          {selectedHackathon ? `Viewing submissions for: ${selectedHackathon.title}` : 'Select a hackathon to review its submissions.'}
        </p>
      </div>

      {/* Hackathon Selector */}
      {!selectedHackathon ? (
        <div>
          <div style={{ ...card, padding: '24px', marginBottom: '20px', background: 'linear-gradient(135deg, #0891b2, #06b6d4)', border: 'none' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: '0 0 4px' }}>Choose a Hackathon to Review</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '14px' }}>You can view all team abstracts for any hackathon.</p>
          </div>
          {hackathons.length === 0 ? (
            <div style={{ ...card, padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>No hackathons available</h3>
              <p style={{ color: '#64748b', margin: 0 }}>Wait for the admin to schedule an event.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hackathons.map(h => (
                <div key={h._id}
                  style={{ ...card, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(8,145,178,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
                  onClick={() => { setSelectedHackathon(h); setPage(1); setSearch(''); }}
                >
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>{h.title}</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                        ⏳ Deadline: {new Date(h.registrationDeadline).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>📅 Event: {new Date(h.eventStartDate).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>📍 {h.location}</span>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>👥 Max {h.maxTeams} teams</span>
                    </div>
                  </div>
                  <button style={{ background: '#0891b2', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    View Abstracts →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── ABSTRACTS VIEW ── */
        <div>
          {/* Hackathon bar */}
          <div style={{ ...card, padding: '16px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Reviewing</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{selectedHackathon.title}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>
                {total} submission{total !== 1 ? 's' : ''}
              </div>
              <button onClick={() => { setSelectedHackathon(null); setTeams([]); }}
                style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ← Change Hackathon
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by team name..."
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'white', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#0891b2'; e.target.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Submissions table/list */}
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
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 110px 130px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                  {['#', 'Team', 'Members', 'Status', 'Abstract'].map(h => (
                    <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                  ))}
                </div>

                {teams.map((team, i) => (
                  <div key={team._id}
                    style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 110px 130px', padding: '16px 20px', borderBottom: i < teams.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Rank */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: team.registrationRank === 1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : team.registrationRank <= 3 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: team.registrationRank <= 3 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                      {team.registrationRank}
                    </div>
                    {/* Team name */}
                    <div>
                      <p style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 2px', fontSize: '14px' }}>{team.teamName}</p>
                      {team.createdBy?.name && <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: '500' }}>by {team.createdBy.name}</p>}
                    </div>
                    {/* Members */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {team.members.map((m, j) => (
                        <span key={j} style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{m}</span>
                      ))}
                    </div>
                    {/* Status */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: team.status === 'accepted' ? '#f0fdf4' : '#fefce8', color: team.status === 'accepted' ? '#15803d' : '#a16207', border: `1px solid ${team.status === 'accepted' ? '#bbf7d0' : '#fde68a'}`, padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {team.status === 'accepted' ? '✅ Accepted' : '⏳ Waitlist'}
                    </span>
                    {/* Read abstract */}
                    <button onClick={() => setSelected(team)}
                      style={{ background: '#eef2ff', color: '#6366f1', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                    >Read Abstract</button>
                  </div>
                ))}

                {/* Pagination */}
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
    </div>
  );
}
