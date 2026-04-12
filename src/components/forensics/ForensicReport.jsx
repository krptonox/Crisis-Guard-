import React, { useState } from 'react';

const ForensicReport = ({ evidence }) => {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(evidence.fileHash || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'HIGH': return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '🔴', num: 1 };
      case 'MEDIUM': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '🟡', num: 2 };
      case 'LOW': return { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: '🟢', num: 3 };
      default: return { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: '⚪', num: 4 };
    }
  };

  const getVerdictIndicator = (verdict) => {
    switch (verdict) {
      case 'Authentic': return { color: '#22c55e', symbol: '✓', text: 'VERDICT: AUTHENTIC' };
      case 'Suspicious': return { color: '#f59e0b', symbol: '!', text: 'VERDICT: SUSPICIOUS' };
      case 'Tampered': return { color: '#ef4444', symbol: '✗', text: 'VERDICT: TAMPERED' };
      default: return { color: '#6b7280', symbol: '?', text: 'VERDICT: UNKNOWN' };
    }
  };

  const vd = getVerdictIndicator(evidence.verdict);

  // Sort findings by severity
  const sortedFindings = [...(evidence.findings || [])].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Report Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>📋</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>
              Forensic Analysis Report
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
            Report ID: {evidence._id}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Generated</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
            {new Date(evidence.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div style={{ padding: '28px' }}>
        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'File Name', value: evidence.fileName, mono: false },
            { label: 'Evidence Type', value: (evidence.fileType || 'N/A').toUpperCase(), mono: false },
            { label: 'Analysis Date', value: new Date(evidence.createdAt).toLocaleDateString(), mono: false },
            { label: 'Confidence Score', value: `${evidence.confidence}%`, mono: false },
          ].map(item => (
            <div key={item.label} style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
            }}>
              <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 600 }}>
                {item.label}
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#e2e8f0',
                fontFamily: item.mono ? 'var(--font-mono)' : 'inherit',
                wordBreak: 'break-all',
              }}>
                {item.value || 'N/A'}
              </p>
            </div>
          ))}
        </div>

        {/* SHA-256 Hash */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>
            SHA-256 File Hash
          </p>
          <div className="hash-display" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ opacity: evidence.fileHash ? 1 : 0.4 }}>
              {evidence.fileHash || 'Hash not available'}
            </span>
            {evidence.fileHash && (
              <button
                onClick={copyHash}
                style={{
                  flexShrink: 0,
                  padding: '4px 10px',
                  background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(6,182,212,0.1)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(6,182,212,0.3)'}`,
                  borderRadius: '6px',
                  color: copied ? '#86efac' : '#67e8f9',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  fontWeight: 600,
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        {/* Verdict Bar */}
        <div style={{
          padding: '18px 22px',
          background: vd.color === '#22c55e' ? 'rgba(34,197,94,0.08)' : vd.color === '#ef4444' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${vd.color}44`,
          borderRadius: '10px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: `${vd.color}22`,
            border: `2px solid ${vd.color}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 800,
            color: vd.color,
            flexShrink: 0,
          }}>
            {vd.symbol}
          </div>
          <div>
            <p style={{ fontSize: '11px', color: vd.color + 'aa', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
              {vd.text}
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
              AI model confidence: <strong style={{ color: vd.color }}>{evidence.confidence}%</strong>
              {' — '}
              Based on {sortedFindings.length} forensic indicators
            </p>
          </div>
        </div>

        {/* Findings Detail Section */}
        <div>
          <h4 style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            🔬 Detailed Findings
          </h4>

          {sortedFindings.length > 0 ? (
            <div style={{ overflow: 'hidden', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="forensic-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: '40px' }}>#</th>
                    <th style={{ textAlign: 'left' }}>Finding Type</th>
                    <th style={{ textAlign: 'left', width: '100px' }}>Severity</th>
                    <th style={{ textAlign: 'left' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFindings.map((finding, idx) => {
                    const scfg = getSeverityConfig(finding.severity);
                    return (
                      <tr key={idx}>
                        <td style={{ color: '#334155', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e8f0' }}>
                            {scfg.icon} {finding.type}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: scfg.bg,
                            color: scfg.color,
                            border: `1px solid ${scfg.color}44`,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}>
                            {finding.severity}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                          {finding.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#475569', textAlign: 'center', padding: '32px' }}>No findings available</p>
          )}
        </div>

        {/* Blockchain & Legal Note */}
        <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Blockchain */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>⛓️</span>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Chain of Custody
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#7c3aed88', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {evidence.fileHash ? evidence.fileHash.substring(0, 24) + '...' : 'Hash pending'}
            </p>
            <p style={{ fontSize: '11px', color: '#6d28d9aa', marginTop: '6px' }}>
              Stored immutably on distributed ledger
            </p>
          </div>

          {/* Legal Note */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(6,182,212,0.06)',
            border: '1px solid rgba(6,182,212,0.15)',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>⚖️</span>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#67e8f9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Legal Notice
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#0891b2aa', lineHeight: 1.5 }}>
              AI-based assessment. For critical legal proceedings, supplement with certified forensic expert analysis.
            </p>
          </div>
        </div>

        {/* Footer Signature */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <p style={{ fontSize: '11px', color: '#334155', fontFamily: 'var(--font-mono)' }}>
            Generated by CrisisguardAI v2.0 | crisisguardai.com
          </p>
          <p style={{ fontSize: '11px', color: '#334155', fontFamily: 'var(--font-mono)' }}>
            ISO 27037 Compliant Digital Forensics
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForensicReport;