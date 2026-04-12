import React, { useState } from 'react';

const severityConfig = {
    HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',  icon: '🔴', label: 'CRITICAL' },
    MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)', icon: '🟡', label: 'MEDIUM'   },
    LOW:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',  icon: '🟢', label: 'LOW'      },
};

const verdictConfig = {
    Authentic:  { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',  icon: '✅', glow: '0 0 30px rgba(34,197,94,0.15)'  },
    Suspicious: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)', icon: '⚠️', glow: '0 0 30px rgba(245,158,11,0.15)' },
    Tampered:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',  icon: '❌', glow: '0 0 30px rgba(239,68,68,0.15)'  },
};

// ── Finding Card ────────────────────────────────────────────────────────────────
const FindingCard = ({ finding, index }) => {
    const [expanded, setExpanded] = useState(false);
    const cfg = severityConfig[finding.severity] || severityConfig.LOW;

    return (
        <div
            style={{
                border: `1px solid ${cfg.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
                background: cfg.bg,
                transition: 'all 0.3s ease',
                animationDelay: `${index * 0.06}s`,
            }}
            className="animate-fade-in-up"
        >
            {/* Header row (always visible) */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    textAlign: 'left',
                }}
            >
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>{cfg.icon}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{
                            fontWeight: 700, fontSize: '13px', color: '#e2e8f0',
                            flexShrink: 1, minWidth: 0,
                        }}>
                            {finding.type}
                        </span>
                        <span style={{
                            padding: '2px 8px', borderRadius: '20px', fontSize: '9px',
                            fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                            background: cfg.border, color: cfg.color, flexShrink: 0,
                        }}>
                            {cfg.label}
                        </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                        {finding.details}
                    </p>
                </div>

                <span style={{
                    color: '#475569', fontSize: '14px', flexShrink: 0, marginTop: '2px',
                    transition: 'transform 0.3s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                    ▾
                </span>
            </button>

            {/* Expanded section: WHY this matters */}
            {expanded && (
                <div style={{
                    padding: '0 16px 16px',
                    borderTop: `1px solid ${cfg.border}`,
                    paddingTop: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    {/* WHY section */}
                    {finding.reason && (
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(6,182,212,0.06)',
                            border: '1px solid rgba(6,182,212,0.2)',
                            borderRadius: '8px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px' }}>🔍</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Why This Matters
                                </span>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.7, margin: 0 }}>
                                {finding.reason}
                            </p>
                        </div>
                    )}

                    {/* Technical detail for experts */}
                    {finding.technical && (
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(139,92,246,0.06)',
                            border: '1px solid rgba(139,92,246,0.2)',
                            borderRadius: '8px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px' }}>⚙️</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Technical Detail
                                </span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontSize: '11px', lineHeight: 1.6, margin: 0 }}>
                                {finding.technical}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Module Score Card ───────────────────────────────────────────────────────────
const ModuleScoreCard = ({ name, data, color }) => {
    if (!data || typeof data !== 'object') return null;
    const { score, interpretation, description, status } = data;
    const passed = status && status.includes('PASS');
    const failed = interpretation === 'HIGH' || interpretation === 'ANOMALY';

    return (
        <div style={{
            padding: '14px',
            background: failed ? 'rgba(239,68,68,0.06)' : passed ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${failed ? 'rgba(239,68,68,0.2)' : passed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '8px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'capitalize' }}>
                    {name.replace(/_/g, ' ')}
                </span>
                <span style={{
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em',
                    padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase',
                    background: failed ? 'rgba(239,68,68,0.15)' : passed ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: failed ? '#fca5a5' : passed ? '#86efac' : '#fcd34d',
                }}>
                    {interpretation || (passed ? 'PASS' : 'NORMAL')}
                </span>
            </div>
            {description && (
                <p style={{ color: '#475569', fontSize: '11px', lineHeight: 1.5, margin: 0 }}>
                    {description}
                </p>
            )}
            {score !== undefined && (
                <p style={{ color: '#334155', fontSize: '11px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Score: {typeof score === 'number' ? score.toFixed(3) : score}
                </p>
            )}
        </div>
    );
};

// ── Recommendation Card ─────────────────────────────────────────────────────────
const RecommendationCard = ({ text, index, verdict }) => {
    const icons = ['🚨', '🔒', '📋', '⚖️', '🔍', '📞'];
    const icon = icons[index % icons.length];
    const urgent = verdict === 'Tampered' && index === 0;

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            padding: '12px 14px',
            background: urgent ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${urgent ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '8px',
        }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
            <p style={{ color: urgent ? '#fca5a5' : '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                {text}
            </p>
        </div>
    );
};

// ── Main VerdictReasonPanel Component ──────────────────────────────────────────
const VerdictReasonPanel = ({ evidence }) => {
    const [activeTab, setActiveTab] = useState('findings');

    if (!evidence) return null;

    const { verdict, confidence, verdictReason, findings = [], recommendations = [], analysisBreakdown = {}, riskLevel, forensicMetadata } = evidence;
    const vcfg = verdictConfig[verdict] || verdictConfig.Suspicious;

    const highFindings = findings.filter(f => f.severity === 'HIGH');
    const medFindings  = findings.filter(f => f.severity === 'MEDIUM');
    const lowFindings  = findings.filter(f => f.severity === 'LOW');
    const sortedFindings = [...highFindings, ...medFindings, ...lowFindings];

    const riskBadgeColor = {
        CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
        HIGH:     { bg: 'rgba(239,68,68,0.1)',  color: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
        MEDIUM:   { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d', border: 'rgba(245,158,11,0.2)' },
        LOW:      { bg: 'rgba(34,197,94,0.1)',  color: '#86efac', border: 'rgba(34,197,94,0.2)' },
        NONE:     { bg: 'rgba(71,85,105,0.1)',  color: '#94a3b8', border: 'rgba(71,85,105,0.2)' },
    }[riskLevel || 'NONE'];

    const moduleEntries = Object.entries(analysisBreakdown || {}).filter(
        ([, val]) => val && typeof val === 'object'
    );

    const tabs = [
        { id: 'findings', label: 'Findings', count: sortedFindings.length },
        { id: 'reasoning', label: 'AI Reasoning', count: null },
        { id: 'modules', label: 'Module Scores', count: moduleEntries.length },
        { id: 'recommendations', label: 'Recommendations', count: recommendations.length },
    ];

    return (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
            {/* Verdict Banner */}
            <div style={{
                padding: '28px 28px 24px',
                background: vcfg.bg,
                borderBottom: `1px solid ${vcfg.border}`,
                boxShadow: vcfg.glow,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        borderRadius: '16px',
                        background: `${vcfg.color}18`,
                        border: `2px solid ${vcfg.color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '26px', flexShrink: 0,
                    }}>
                        {vcfg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: vcfg.color, margin: 0 }}>
                                {verdict}
                            </h3>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>—</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: vcfg.color }}>
                                {confidence}% confidence
                            </span>
                            {riskLevel && (
                                <span style={{
                                    padding: '2px 10px', borderRadius: '20px', fontSize: '9px',
                                    fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                                    ...riskBadgeColor,
                                }}>
                                    {riskLevel} RISK
                                </span>
                            )}
                        </div>

                        {/* Verdict Reason — plain English */}
                        {verdictReason && (
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '14px',
                                lineHeight: 1.75,
                                margin: 0,
                                maxWidth: '800px',
                            }}>
                                {verdictReason}
                            </p>
                        )}
                    </div>
                </div>

                {/* Summary badges */}
                {sortedFindings.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {highFindings.length > 0 && (
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)'
                            }}>
                                🔴 {highFindings.length} Critical
                            </span>
                        )}
                        {medFindings.length > 0 && (
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)'
                            }}>
                                🟡 {medFindings.length} Medium
                            </span>
                        )}
                        {lowFindings.length > 0 && (
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)'
                            }}>
                                🟢 {lowFindings.length} Low
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.2)',
                overflowX: 'auto',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 18px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: activeTab === tab.id ? '#06b6d4' : '#475569',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        {tab.label}
                        {tab.count !== null && (
                            <span style={{
                                fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
                                background: activeTab === tab.id ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.06)',
                                color: activeTab === tab.id ? '#06b6d4' : '#475569',
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '24px 28px' }}>

                {/* ── FINDINGS TAB ── */}
                {activeTab === 'findings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {sortedFindings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                                <p>No forensic anomalies detected.</p>
                            </div>
                        ) : (
                            sortedFindings.map((f, i) => <FindingCard key={i} finding={f} index={i} />)
                        )}
                    </div>
                )}

                {/* ── REASONING TAB ── */}
                {activeTab === 'reasoning' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* The full verdict reason block */}
                        <div style={{
                            padding: '20px',
                            background: `${vcfg.color}08`,
                            border: `1px solid ${vcfg.color}33`,
                            borderRadius: '10px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '18px' }}>🧠</span>
                                <h4 style={{ fontWeight: 700, color: vcfg.color, fontSize: '14px', margin: 0 }}>
                                    AI Verdict Reasoning
                                </h4>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                                {verdictReason || 'No detailed reasoning available.'}
                            </p>
                        </div>

                        {/* Finding-level reasons */}
                        {sortedFindings.filter(f => f.reason).length > 0 && (
                            <>
                                <h4 style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0' }}>
                                    Finding-Level Explanations
                                </h4>
                                {sortedFindings.filter(f => f.reason).map((f, i) => {
                                    const fcfg = severityConfig[f.severity] || severityConfig.LOW;
                                    return (
                                        <div key={i} style={{
                                            padding: '14px 16px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${fcfg.border}`,
                                            borderRadius: '8px',
                                        }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                                <span>{fcfg.icon}</span>
                                                <span style={{ fontWeight: 700, fontSize: '13px', color: fcfg.color }}>{f.type}</span>
                                            </div>
                                            <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.7, margin: 0 }}>
                                                {f.reason}
                                            </p>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}

                {/* ── MODULES TAB ── */}
                {activeTab === 'modules' && (
                    <div>
                        {moduleEntries.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No module data available.</p>
                        ) : (
                            <>
                                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '16px' }}>
                                    Each module below ran a specific forensic check. Click on findings to see why any anomaly was flagged.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                                    {moduleEntries.map(([name, data]) => (
                                        <ModuleScoreCard key={name} name={name} data={data} color="#06b6d4" />
                                    ))}
                                </div>
                                {/* Forensic metadata */}
                                {forensicMetadata && Object.keys(forensicMetadata).length > 0 && (
                                    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                            File-Specific Metadata
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                                            {Object.entries(forensicMetadata).map(([k, v]) => (
                                                <div key={k}>
                                                    <span style={{ fontSize: '11px', color: '#334155', display: 'block' }}>{k.replace(/_/g, ' ')}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                                                        {String(v)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── RECOMMENDATIONS TAB ── */}
                {activeTab === 'recommendations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recommendations.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No recommendations available.</p>
                        ) : (
                            <>
                                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '8px' }}>
                                    Based on the analysis, the following actions are recommended:
                                </p>
                                {recommendations.map((rec, i) => (
                                    <RecommendationCard key={i} text={rec} index={i} verdict={verdict} />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerdictReasonPanel;
