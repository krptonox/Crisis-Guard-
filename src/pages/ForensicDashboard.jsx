import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvidences, exportCSV } from '../services/forensicsApi';
import FileUpload from '../components/forensics/FileUpload';
import api from '../services/forensicsApi';

const getVerdictConfig = (verdict) => {
  switch (verdict) {
    case 'Authentic': return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', icon: '✅', text: '#86efac' };
    case 'Suspicious': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '⚠️', text: '#fcd34d' };
    case 'Tampered': return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: '❌', text: '#fca5a5' };
    default: return { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)', icon: '⏳', text: '#9ca3af' };
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'document': return '📄';
    default: return '📁';
  }
};

const ConfidenceBar = ({ value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 1s ease' }} />
    </div>
    <span style={{ fontSize: '12px', fontWeight: 600, color, minWidth: '36px', textAlign: 'right' }}>{value}%</span>
  </div>
);

const ForensicDashboard = () => {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [showUpload, setShowUpload] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking

  useEffect(() => { fetchEvidences(); checkBackend(); }, []);

  const checkBackend = async () => {
    try {
      await api.get('/health', { timeout: 3000 });
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchEvidences = async () => {
    try {
      const data = await getAllEvidences();
      setEvidences(data);
    } catch (error) {
      console.error('Failed to fetch evidences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = evidences.filter(e => {
    const matchVerdict = filter === 'All' || e.verdict === filter;
    const matchType = typeFilter === 'All' || e.fileType === typeFilter.toLowerCase();
    const matchSearch = !search || e.fileName?.toLowerCase().includes(search.toLowerCase());
    return matchVerdict && matchType && matchSearch;
  });

  const stats = {
    total: evidences.length,
    tampered: evidences.filter(e => e.verdict === 'Tampered').length,
    authentic: evidences.filter(e => e.verdict === 'Authentic').length,
    suspicious: evidences.filter(e => e.verdict === 'Suspicious').length,
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid rgba(6,182,212,0.2)', borderTop: '3px solid #06b6d4', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#64748b', fontSize: '15px' }}>Loading evidence database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root min-h-screen bg-bg" style={{ paddingTop: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Backend Offline Notice */}
        {backendOnline === false && (
          <div style={{ marginBottom: '24px', padding: '14px 20px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ color: '#fcd34d', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Backend Server Offline</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
                The forensics backend is not running. To enable evidence upload &amp; analysis, start the Node.js server:
              </p>
              <code style={{ display: 'inline-block', marginTop: '8px', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '12px', color: '#67e8f9', fontFamily: 'monospace' }}>
                cd backend &amp;&amp; npm install &amp;&amp; npm start
              </code>
              <p style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>Also requires MongoDB and optionally the Python AI service on port 8000.</p>
            </div>
          </div>
        )}


        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="section-label" style={{ fontSize: '11px', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
              Investigation Center
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#f1f5f9' }}>
              Forensic Evidence Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              {evidences.length} case{evidences.length !== 1 ? 's' : ''} in database
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={exportCSV} className="glass-card" style={{ fontSize: '13px', padding: '10px 16px', cursor: 'pointer', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
              ⬇️ Export CSV
            </button>
            <button onClick={() => setShowUpload(v => !v)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', border: 'none', padding: '10px 20px', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              {showUpload ? '✕ Close Upload' : '+ New Analysis'}
            </button>
          </div>
        </div>

        {/* Inline Upload */}
        {showUpload && (
          <div className="glass-card" style={{ marginBottom: '28px', padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '20px', fontSize: '18px' }}>🔬 Upload New Evidence</h3>
            <FileUpload />
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total Analyzed', value: stats.total, color: '#06b6d4', icon: '🔬' },
            { label: 'Tampered', value: stats.tampered, color: '#ef4444', icon: '❌' },
            { label: 'Authentic', value: stats.authentic, color: '#22c55e', icon: '✅' },
            { label: 'Suspicious', value: stats.suspicious, color: '#f59e0b', icon: '⚠️' },
          ].map(stat => (
            <div key={stat.label} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '14px' }}>🔍</span>
            <input type="text" placeholder="Search by filename..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Authentic', 'Suspicious', 'Tampered'].map(v => {
              const vCfg = getVerdictConfig(v);
              return (
                <button key={v} onClick={() => setFilter(v)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: filter === v ? `1px solid ${vCfg.color}66` : '1px solid rgba(255,255,255,0.08)', background: filter === v ? vCfg.bg : 'transparent', color: filter === v ? vCfg.text : '#64748b', transition: 'all 0.2s ease' }}>
                  {v === 'All' ? 'All' : `${vCfg.icon} ${v}`}
                </button>
              );
            })}
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
            {['All', 'Image', 'Video', 'Document'].map(t => <option key={t} value={t} style={{ background: '#0d1526' }}>{t}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ mode: 'table', icon: '☰' }, { mode: 'cards', icon: '⊞' }].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: viewMode === v.mode ? 'rgba(6,182,212,0.15)' : 'transparent', color: viewMode === v.mode ? '#06b6d4' : '#475569', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' }}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
              {evidences.length === 0 ? 'No Evidence Analyzed Yet' : 'No Results Match Your Filters'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              {evidences.length === 0 ? 'Upload your first file to start verifying digital evidence.' : 'Try adjusting your search or filters.'}
            </p>
            {evidences.length === 0 && (
              <button onClick={() => setShowUpload(true)} style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', border: 'none', padding: '12px 24px', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                Upload First Evidence
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Evidence', 'Type', 'Verdict', 'Confidence', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((evidence) => {
                    const vcfg = getVerdictConfig(evidence.verdict);
                    return (
                      <tr key={evidence._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px' }}>{getTypeIcon(evidence.fileType)}</span>
                            <span style={{ fontWeight: 500, color: '#e2e8f0', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evidence.fileName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{evidence.fileType || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: vcfg.bg, color: vcfg.text, border: `1px solid ${vcfg.border}`, textTransform: 'uppercase' }}>
                            {vcfg.icon} {evidence.verdict}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', minWidth: '140px' }}><ConfidenceBar value={evidence.confidence || 0} color={vcfg.color} /></td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px', whiteSpace: 'nowrap' }}>{new Date(evidence.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Link to={`/forensics/report/${evidence._id}`} style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>View Report →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filtered.map((evidence) => {
              const vcfg = getVerdictConfig(evidence.verdict);
              return (
                <div key={evidence._id} className="glass-card" style={{ padding: '20px', borderTop: `2px solid ${vcfg.color}44` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{getTypeIcon(evidence.fileType)}</span>
                      <div>
                        <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evidence.fileName}</p>
                        <p style={{ color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>{evidence.fileType} • {new Date(evidence.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: vcfg.bg, color: vcfg.text, border: `1px solid ${vcfg.border}`, textTransform: 'uppercase', flexShrink: 0 }}>{vcfg.icon}</span>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#475569' }}>Confidence</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: vcfg.color }}>{evidence.confidence}%</span>
                    </div>
                    <ConfidenceBar value={evidence.confidence || 0} color={vcfg.color} />
                  </div>
                  <Link to={`/forensics/report/${evidence._id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', fontSize: '13px', padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#06b6d4', cursor: 'pointer' }}>View Full Report →</button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p style={{ fontSize: '12px', color: '#334155', textAlign: 'center', marginTop: '16px' }}>
            Showing {filtered.length} of {evidences.length} cases
          </p>
        )}
      </div>
    </div>
  );
};

export default ForensicDashboard;
