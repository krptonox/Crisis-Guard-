import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const getVerdictConfig = (verdict) => {
  switch (verdict) {
    case 'Authentic':
      return {
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 0.3)',
        textColor: '#86efac',
        icon: '✅',
        glow: '0 0 30px rgba(34, 197, 94, 0.35)',
        label: 'AUTHENTIC',
        subtext: 'No significant tampering detected',
      };
    case 'Suspicious':
      return {
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        textColor: '#fcd34d',
        icon: '⚠️',
        glow: '0 0 30px rgba(245, 158, 11, 0.35)',
        label: 'SUSPICIOUS',
        subtext: 'Further examination recommended',
      };
    case 'Tampered':
      return {
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
        textColor: '#fca5a5',
        icon: '❌',
        glow: '0 0 30px rgba(239, 68, 68, 0.40)',
        label: 'TAMPERED',
        subtext: 'High probability of digital manipulation',
      };
    default:
      return {
        color: '#6b7280',
        bg: 'rgba(107, 114, 128, 0.1)',
        border: 'rgba(107, 114, 128, 0.3)',
        textColor: '#9ca3af',
        icon: '⏳',
        glow: 'none',
        label: 'PENDING',
        subtext: 'Analysis in progress',
      };
  }
};

const getSeverityConfig = (severity) => {
  switch (severity) {
    case 'HIGH': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', dot: '#ef4444' };
    case 'MEDIUM': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', dot: '#f59e0b' };
    case 'LOW': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', dot: '#22c55e' };
    default: return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', dot: '#6b7280' };
  }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13, 21, 38, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#f1f5f9',
      }}>
        {payload[0].name}: <strong>{payload[0].value}</strong>
      </div>
    );
  }
  return null;
};

const riskBadge = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
  HIGH:     { bg: 'rgba(239,68,68,0.1)',  color: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
  MEDIUM:   { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d', border: 'rgba(245,158,11,0.2)' },
  LOW:      { bg: 'rgba(34,197,94,0.1)',  color: '#86efac', border: 'rgba(34,197,94,0.2)' },
  NONE:     { bg: 'rgba(71,85,105,0.1)',  color: '#94a3b8', border: 'rgba(71,85,105,0.2)' },
};

const ResultDashboard = ({ result }) => {
  const [expandedFinding, setExpandedFinding] = useState(null);

  const cfg = getVerdictConfig(result.verdict);
  const rl = riskBadge[result.riskLevel || 'NONE'];

  const pieData = [
    { name: 'Confidence', value: result.confidence, color: cfg.color },
    { name: 'Uncertainty', value: 100 - result.confidence, color: 'rgba(255,255,255,0.06)' },
  ];

  const severityCounts = (result.findings || []).reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  const barData = [
    { name: 'HIGH', count: severityCounts.HIGH || 0, fill: '#ef4444' },
    { name: 'MEDIUM', count: severityCounts.MEDIUM || 0, fill: '#f59e0b' },
    { name: 'LOW', count: severityCounts.LOW || 0, fill: '#22c55e' },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Verdict Hero Banner */}
      <div className="glass-card" style={{
        padding: '40px',
        textAlign: 'center',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '52px', marginBottom: '12px', filter: `drop-shadow(0 0 20px ${cfg.color}88)` }}>
            {cfg.icon}
          </div>

          {/* Verdict label + risk badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.25em', color: cfg.textColor, fontWeight: 700, textTransform: 'uppercase' }}>VERDICT</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: cfg.textColor, textShadow: `0 0 30px ${cfg.color}66`, margin: 0 }}>
              {cfg.label}
            </h2>
            {result.riskLevel && result.riskLevel !== 'NONE' && (
              <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', ...rl }}>
                {result.riskLevel} RISK
              </span>
            )}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: result.verdictReason ? '16px' : '0' }}>{cfg.subtext}</p>

          {/* Plain-English verdict reason — short teaser */}
          {result.verdictReason && (
            <div style={{
              maxWidth: '680px', margin: '0 auto',
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${cfg.color}22`,
              borderRadius: '10px',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                <span style={{ color: cfg.color, fontWeight: 700 }}>🧠 AI: </span>
                {result.verdictReason.length > 200 ? result.verdictReason.substring(0, 200) + '...' : result.verdictReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Confidence Score', value: `${result.confidence}%`, color: cfg.color },
          { label: 'Total Findings', value: result.findings?.length || 0, color: '#8b5cf6' },
          { label: 'Critical (HIGH)', value: severityCounts.HIGH || 0, color: '#ef4444' },
          { label: 'File Type', value: (result.fileType || 'N/A').toUpperCase(), color: '#06b6d4' },
          { label: 'Engine', value: `v${result.engineVersion || '2.0'}`, color: '#475569' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Pie Chart */}
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
            Confidence Score
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '-8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: cfg.color }}>
              {result.confidence}%
            </span>
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Tampering Confidence</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
            Finding Severity
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Findings Timeline */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔍 Forensic Findings
          <span style={{
            fontSize: '11px', padding: '2px 8px',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '20px',
            color: '#c4b5fd',
            fontFamily: 'var(--font-mono)',
          }}>
            {result.findings?.length || 0} items
          </span>
        </h3>

        {result.findings && result.findings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.findings.map((finding, idx) => {
              const scfg = getSeverityConfig(finding.severity);
              const expanded = expandedFinding === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setExpandedFinding(expanded ? null : idx)}
                  style={{
                    padding: '14px 18px',
                    background: scfg.bg,
                    border: `1px solid ${scfg.border}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: scfg.dot,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${scfg.dot}88`,
                      }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>
                          {finding.type}
                        </p>
                        {expanded && (
                          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.5 }}>
                            {finding.details}
                          </p>
                        )}
                        {!expanded && (
                          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {finding.details.substring(0, 70)}{finding.details.length > 70 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        background: scfg.bg,
                        color: scfg.color,
                        border: `1px solid ${scfg.border}`,
                        textTransform: 'uppercase',
                      }}>
                        {finding.severity}
                      </span>
                      <span style={{ color: '#475569', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#22c55e' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <p style={{ fontWeight: 600 }}>No anomalies detected</p>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>Evidence appears authentic under all analysis modules</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDashboard;