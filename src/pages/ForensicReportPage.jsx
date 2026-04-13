import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getEvidence, reanalyzeEvidence } from '../services/forensicsApi';
import ResultDashboard from '../components/forensics/ResultDashboard';
import ForensicReport from '../components/forensics/ForensicReport';
import VerdictReasonPanel from '../components/forensics/VerdictReasonPanel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ForensicReportPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isAiSource = searchParams.get('source') === 'ai';
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzed, setReanalyzed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchEvidence(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      if (isAiSource) {
        // Load result directly from sessionStorage (AI service path)
        const raw = sessionStorage.getItem(`ai_result_${id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Normalize field names so child components work with both sources
          setEvidence({
            _id: parsed.evidenceId || id,
            fileName: parsed.fileName,
            originalName: parsed.fileName,
            fileType: parsed.fileType,
            fileSize: parsed.fileSize,
            verdict: parsed.verdict,
            confidence: parsed.confidence,
            findings: parsed.findings || [],
            analysis_breakdown: parsed.analysis_breakdown || {},
            verdictReason: parsed.verdict_reason,
            recommendations: parsed.recommendations || [],
            fileHash: parsed.fileHash || '(computed by AI service)',
            engineVersion: parsed.engineVersion || '2.0.0',
            analyzedAt: parsed.analyzedAt,
            source: 'ai-service',
          });
        } else {
          setError('AI analysis result not found. The session may have expired.');
        }
      } else {
        const data = await getEvidence(id);
        setEvidence(data);
      }
    } catch (err) {
      setError('Report not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await reanalyzeEvidence(id);
      await fetchEvidence();
      setReanalyzed(true);
      setTimeout(() => setReanalyzed(false), 3000);
    } catch (err) {
      alert('Re-analysis failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setReanalyzing(false);
    }
  };

  const copyHash = () => {
    if (evidence?.fileHash) {
      navigator.clipboard.writeText(evidence.fileHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const verdictColor = evidence.verdict === 'Authentic' ? [34, 197, 94] :
        evidence.verdict === 'Suspicious' ? [245, 158, 11] : [239, 68, 68];

      doc.setFillColor(5, 11, 24);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setFillColor(...verdictColor, 0.12);
      doc.rect(0, 0, 210, 50, 'F');

      doc.setTextColor(...verdictColor);
      doc.setFontSize(22); doc.setFont('helvetica', 'bold');
      doc.text('CRISIS GUARD', 14, 20);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Digital Evidence Forensic Report  |  ISO 27037 Aligned  |  Blockchain Evidence Trail', 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()}   |   Engine v${evidence.engineVersion || '2.0.0'}`, 14, 35);
      doc.setFontSize(7.5);
      doc.text(`Report ID: ${evidence._id}`, 210 - 14, 20, { align: 'right' });
      doc.text(`Hash: ${(evidence.fileHash || '').substring(0, 32)}...`, 210 - 14, 27, { align: 'right' });

      doc.setFillColor(...verdictColor);
      doc.rect(0, 54, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      const icon = evidence.verdict === 'Authentic' ? '✓' : evidence.verdict === 'Suspicious' ? '!' : '✗';
      doc.text(`${icon}  VERDICT: ${evidence.verdict?.toUpperCase()}`, 14, 66);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`Confidence: ${evidence.confidence}%   |   Risk Level: ${evidence.riskLevel || 'N/A'}`, 14, 77);

      doc.setTextColor(226, 232, 240);
      doc.setFontSize(8.5);
      let y = 95;
      doc.text(`File Name:   ${evidence.originalName || evidence.fileName}`, 14, y); y += 7;
      doc.text(`File Type:   ${evidence.fileType}`, 14, y); y += 7;
      doc.text(`File Size:   ${evidence.fileSize ? (evidence.fileSize / 1024).toFixed(1) + ' KB' : 'N/A'}`, 14, y); y += 7;
      doc.text(`Analyzed:    ${evidence.analyzedAt ? new Date(evidence.analyzedAt).toLocaleString() : 'N/A'}`, 14, y); y += 7;
      doc.setTextColor(71, 85, 105);
      doc.text(`SHA-256: ${evidence.fileHash || 'N/A'}`, 14, y); y += 10;

      if (evidence.verdictReason) {
        doc.setTextColor(226, 232, 240);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text('AI Verdict Reasoning', 14, y); y += 6;
        doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        const lines = doc.splitTextToSize(evidence.verdictReason, 182);
        doc.text(lines, 14, y); y += lines.length * 5 + 8;
      }

      doc.setTextColor(226, 232, 240);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text('Forensic Findings', 14, y); y += 4;

      const sortedFindings = [...(evidence.findings || [])].sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
      });

      autoTable(doc, {
        startY: y,
        head: [['Finding', 'Severity', 'Details', 'Why It Matters']],
        body: sortedFindings.map(f => [f.type, f.severity, f.details, f.reason || '']),
        theme: 'grid',
        headStyles: { fillColor: [13, 21, 38], textColor: [6, 182, 212], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fillColor: [5, 11, 24], textColor: [226, 232, 240], fontSize: 7, lineColor: [30, 41, 59] },
        columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 18 }, 2: { cellWidth: 68 }, 3: { cellWidth: 'auto' } },
        alternateRowStyles: { fillColor: [13, 21, 38] },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            const sev = data.cell.raw;
            data.cell.styles.textColor = sev === 'HIGH' ? [239, 68, 68] : sev === 'MEDIUM' ? [245, 158, 11] : [34, 197, 94];
          }
        }
      });

      let finalY = Math.min(doc.lastAutoTable.finalY + 12, 265);

      if (evidence.recommendations?.length > 0) {
        doc.setTextColor(226, 232, 240);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text('Recommendations', 14, finalY); finalY += 5;
        doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        for (const rec of evidence.recommendations) {
          if (finalY > 270) break;
          const rLines = doc.splitTextToSize(`• ${rec}`, 182);
          doc.text(rLines, 14, finalY);
          finalY += rLines.length * 4.5 + 2;
        }
      }

      finalY = Math.max(finalY + 8, 265);
      doc.setFontSize(7); doc.setTextColor(51, 65, 85);
      doc.text('LEGAL NOTICE: This AI-generated report supports preliminary assessment only. Human expert certification is required for court submission.', 14, finalY);
      doc.setTextColor(6, 182, 212);
      doc.text('Crisis Guard — Globe Intelligence Platform', 14, finalY + 8);

      doc.save(`forensic_report_${evidence._id}.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(6,182,212,0.1)', border: '2px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>
            🔍
          </div>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 500 }}>Loading forensic report...</p>
          <p style={{ color: '#334155', fontSize: '13px', marginTop: '8px' }}>Pulling analysis from evidence database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', maxWidth: '460px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>😵</div>
          <h2 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>Report Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>{error}</p>
          <Link to="/forensics" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', border: 'none', padding: '12px 24px', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>← Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const verdictColor = evidence.verdict === 'Authentic' ? '#22c55e' :
    evidence.verdict === 'Tampered' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', background: '#070b14' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Breadcrumb + Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Link to="/forensics" style={{ color: '#64748b', textDecoration: 'none' }}>Deepfake Detection</Link>
            <span style={{ color: '#334155' }}>→</span>
            <span style={{ color: '#94a3b8', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {evidence.originalName || evidence.fileName}
            </span>
            {isAiSource && (
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.1)', color: '#86efac', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 700 }}>
                AI SERVICE
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!isAiSource && (
              <button onClick={handleReanalyze} disabled={reanalyzing} style={{ fontSize: '13px', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: reanalyzed ? 'rgba(34,197,94,0.1)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: reanalyzed ? '#86efac' : '#94a3b8', cursor: reanalyzing ? 'not-allowed' : 'pointer' }}>
                {reanalyzing ? '⏳ Re-analyzing...' : reanalyzed ? '✓ Re-analyzed!' : '🔄 Re-Analyze'}
              </button>
            )}
            <button onClick={downloadPDF} disabled={downloading} style={{ fontSize: '13px', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px', background: downloaded ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)', border: 'none', borderRadius: '8px', color: 'white', cursor: downloading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {downloading ? '⏳ Generating...' : downloaded ? '✓ Downloaded!' : '📄 Download PDF'}
            </button>
            <Link to="/forensics" style={{ textDecoration: 'none' }}>
              <button style={{ fontSize: '13px', padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>
                + New Analysis
              </button>
            </Link>
          </div>
        </div>

        {/* Blockchain Hash Banner */}
        <div className="glass-card" style={{ padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '3px solid rgba(6,182,212,0.5)' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>⛓️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>SHA-256 Blockchain Reference: </span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#06b6d4', wordBreak: 'break-all' }}>
              {evidence.fileHash || 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={copyHash} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(6,182,212,0.1)', border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(6,182,212,0.3)', color: copied ? '#86efac' : '#67e8f9', cursor: 'pointer' }}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(34,197,94,0.1)', color: '#86efac', border: '1px solid rgba(34,197,94,0.2)' }}>IMMUTABLE</span>
          </div>
        </div>

        {/* Re-analysis badge */}
        {evidence.reanalysisCount > 0 && (
          <div style={{ padding: '8px 16px', marginBottom: '16px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔄</span>
            <span>This evidence has been re-analyzed <strong>{evidence.reanalysisCount}</strong> time{evidence.reanalysisCount > 1 ? 's' : ''}.
              Last: {evidence.lastReanalyzedAt ? new Date(evidence.lastReanalyzedAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        )}

        {/* Core Report Components */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ResultDashboard result={evidence} />
          <VerdictReasonPanel evidence={evidence} />
          <ForensicReport evidence={evidence} />
        </div>

        {/* Bottom CTA */}
        <div className="glass-card" style={{ marginTop: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: `2px solid ${verdictColor}33` }}>
          <div>
            <h4 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>Scan another file?</h4>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Run deepfake detection on more images, videos, or documents.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/forensics" style={{ textDecoration: 'none' }}>
              <button style={{ fontSize: '13px', padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>View All Cases</button>
            </Link>
            <Link to="/forensics" style={{ textDecoration: 'none' }}>
              <button style={{ fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>+ Analyze New File</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicReportPage;
