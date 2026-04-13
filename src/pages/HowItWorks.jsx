import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    icon: '📤',
    title: 'Upload Your Evidence',
    desc: 'Drag and drop or click to upload any digital evidence file. We support images (JPEG, PNG, BMP, WebP), videos (MP4, AVI, MOV), documents (PDF), and chat exports (TXT).',
    detail: 'Files are encrypted in transit using TLS 1.3 and processed in isolated containers. We never store your evidence permanently — all files are deleted after analysis.',
    color: '#06b6d4',
    tips: ['Max file size: 100MB', 'Multiple formats supported', 'End-to-end encrypted'],
  },
  {
    step: '02',
    icon: '🔐',
    title: 'Cryptographic Hash Generation',
    desc: 'Before any analysis begins, a SHA-256 cryptographic fingerprint is computed for your file. This hash uniquely identifies the exact byte sequence of your evidence.',
    detail: 'The SHA-256 hash acts as a tamper-evident seal. Any modification to the file — even changing a single pixel — would produce a completely different hash, making it impossible to manipulate evidence without detection.',
    color: '#8b5cf6',
    tips: ['SHA-256 algorithm', 'Collision-resistant', 'Blockchain anchored'],
  },
  {
    step: '03',
    icon: '🔬',
    title: 'Multi-Module Forensic Analysis',
    desc: 'Our forensic engine runs 6+ detection modules simultaneously — each specialized for a different type of manipulation.',
    detail: 'For images: ELA (Error Level Analysis) reveals JPEG re-compression artifacts from copy-paste edits. Noise pattern analysis detects sensor fingerprint inconsistencies. For videos: Face consistency tracking, blinking pattern analysis, and audio-visual sync checking. For documents: PDF structure validation, embedded script detection, font analysis.',
    color: '#f59e0b',
    tips: ['ELA for images', 'Frame-by-frame for video', 'PDF structure scan'],
  },
  {
    step: '04',
    icon: '🧠',
    title: 'AI Ensemble Assessment',
    desc: 'Multiple AI models independently assess the same evidence and their votes are aggregated for the final verdict.',
    detail: 'Inspired by XceptionNet and MesoNet architectures, our ensemble approach prevents single-model failures and produces calibrated confidence scores. The system uses weighted voting where models with higher precision get more influence on the final verdict.',
    color: '#22c55e',
    tips: ['Ensemble voting', 'Calibrated confidence', 'Explainable output'],
  },
  {
    step: '05',
    icon: '⛓️',
    title: 'Blockchain Anchoring',
    desc: 'The file hash and analysis results are anchored to a distributed ledger, creating an immutable chain of custody record.',
    detail: 'Using the SHA-256 hash as an identifier, the evidence metadata is stored in an append-only distributed ledger. This means it\'s mathematically impossible to alter the record after the fact — providing court-admissible proof that the file analyzed is exactly the file that was reported on.',
    color: '#ec4899',
    tips: ['Immutable record', 'Timestamp proof', 'Court-admissible'],
  },
  {
    step: '06',
    icon: '📋',
    title: 'Forensic Report Generation',
    desc: 'A comprehensive court-ready forensic report is generated with all findings, confidence scores, blockchain reference, and legal notices.',
    detail: 'The PDF report follows digital forensics documentation standards (aligned with ISO 27037). It includes: verdict with confidence percentage, detailed findings sorted by severity, SHA-256 hash for chain of custody, blockchain reference number, and a legal notice regarding AI-assisted analysis.',
    color: '#14b8a6',
    tips: ['PDF download', 'Severity sorted', 'ISO 27037 aligned'],
  },
];

const EVIDENCE_TYPES = [
  {
    type: 'Images',
    icon: '🖼️',
    color: '#8b5cf6',
    techniques: [
      { name: 'Error Level Analysis (ELA)', desc: 'Detects JPEG re-compression artifacts that occur when regions of an image are edited and re-saved.' },
      { name: 'Noise Pattern Analysis', desc: 'Camera sensors produce unique noise signatures. Edited regions often show different noise patterns.' },
      { name: 'Edge Artifact Detection', desc: 'Copy-paste manipulation often introduces unnatural edge patterns invisible to the human eye.' },
      { name: 'EXIF Metadata Verification', desc: 'Cross-checks embedded metadata (camera model, GPS, timestamp) for consistency.' },
    ],
  },
  {
    type: 'Videos',
    icon: '🎥',
    color: '#06b6d4',
    techniques: [
      { name: 'Face Consistency Tracking', desc: 'Deepfake models often fail to maintain consistent facial proportions across frames.' },
      { name: 'Blinking Pattern Analysis', desc: 'Early deepfakes rarely blink naturally — unnatural blinking rates are a key indicator.' },
      { name: 'Frame Differential Analysis', desc: 'Detects discontinuities between frames indicating cuts or insertions.' },
      { name: 'Audio-Visual Sync Check', desc: 'Measures alignment between lip movements and audio waveform patterns.' },
    ],
  },
  {
    type: 'Documents',
    icon: '📄',
    color: '#f59e0b',
    techniques: [
      { name: 'PDF Structure Validation', desc: 'Verifies the PDF header, cross-reference tables, and object structure for tampering.' },
      { name: 'Embedded Script Detection', desc: 'Identifies JavaScript or hidden layers that may indicate document manipulation.' },
      { name: 'Font Consistency Analysis', desc: 'Edited documents often have font rendering inconsistencies from different PDF creation tools.' },
      { name: 'Metadata Cross-Check', desc: 'Compares document creation date, author, and modification timestamps for contradictions.' },
    ],
  },
  {
    type: 'Chat Exports',
    icon: '💬',
    color: '#22c55e',
    techniques: [
      { name: 'Timestamp Consistency', desc: 'Checks message timestamps for logical sequence and time-zone consistency.' },
      { name: 'Format Validation', desc: 'WhatsApp, Telegram, and iMessage exports have specific format patterns that are hard to perfectly replicate.' },
      { name: 'Screenshot ELA', desc: 'Applies same ELA techniques to detect edited screenshot regions especially around timestamps and names.' },
      { name: 'Contact Hash Check', desc: 'Authentic screenshots embed subtle rendering artifacts from contact profile pictures.' },
    ],
  },
];

const FAQ_ITEMS = [
  { q: 'Is my evidence kept private?', a: 'Yes. All uploads are encrypted using TLS 1.3. Files are processed in isolated containerized environments and permanently deleted after analysis. We do not store your files.' },
  { q: 'How accurate is the detection?', a: 'Our system achieves >92% accuracy on FaceForensics++ benchmark for video deepfakes, >85% precision for image manipulation, and >90% for PDF tampering. Confidence scores are calibrated using ensemble methods.' },
  { q: 'Can this be used as legal evidence?', a: 'The forensic report is designed to support legal proceedings. The blockchain hash and chain of custody documentation follow ISO 27037 standards. Courts increasingly accept AI-assisted forensics when accompanied by expert validation.' },
  { q: 'What file types are supported?', a: 'Images: JPEG, PNG, BMP, WebP. Videos: MP4, AVI, MOV, MKV. Documents: PDF. Chat exports: TXT. Maximum file size is 100MB.' },
  { q: 'How long does analysis take?', a: 'Images: typically 5-15 seconds. Videos: 30-90 seconds depending on length. Documents: 10-20 seconds. You\'ll see real-time progress during analysis.' },
  { q: 'Does the system produce false positives?', a: 'Yes, false positives are possible, which is why we show confidence scores rather than binary verdicts. The system recommends human expert review for critical cases, especially when confidence is below 80%.' },
];

const HowItWorks = () => {
  const [activeType, setActiveType] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', paddingTop: '64px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <p className="section-label animate-fade-in-up">Forensic Methodology</p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}
          className="animate-fade-in-up delay-100"
        >
          How{' '}
          <span style={{
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Crisis Guard
          </span>{' '}
          Detects Manipulation
        </h1>
        <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7 }} className="animate-fade-in-up delay-200">
          A transparent look at every step of our forensic analysis pipeline — from evidence upload to court-ready report.
        </p>
      </section>

      {/* Steps */}
      <section style={{ padding: '40px 24px 100px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className="glass-card animate-fade-in-up"
              style={{
                padding: '32px',
                opacity: 0,
                animation: `fadeInUp 0.6s ${i * 0.1}s ease forwards`,
                borderLeft: `3px solid ${step.color}66`,
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: '60px', height: '60px',
                  borderRadius: '16px',
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px',
                  flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: step.color, fontWeight: 700, letterSpacing: '0.1em' }}>
                      STEP {step.step}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '20px', color: '#f1f5f9', marginBottom: '10px' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, marginBottom: '14px' }}>
                    {step.desc}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>
                    {step.detail}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {step.tips.map(tip => (
                      <span key={tip} style={{
                        fontSize: '11px', fontWeight: 600,
                        padding: '3px 12px', borderRadius: '20px',
                        background: `${step.color}15`,
                        color: step.color,
                        border: `1px solid ${step.color}30`,
                        letterSpacing: '0.05em',
                      }}>
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detection Techniques by Evidence Type */}
      <section style={{
        padding: '100px 24px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="section-label">Deep Dive</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#f1f5f9' }}>
              Detection Techniques by Evidence Type
            </h2>
          </div>

          {/* Tab navigation */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {EVIDENCE_TYPES.map((et, i) => (
              <button
                key={et.type}
                onClick={() => setActiveType(i)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeType === i ? `1px solid ${et.color}55` : '1px solid rgba(255,255,255,0.08)',
                  background: activeType === i ? `${et.color}15` : 'transparent',
                  color: activeType === i ? et.color : '#64748b',
                  transition: 'all 0.2s ease',
                }}
              >
                {et.icon} {et.type}
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '32px' }}>
            {(() => {
              const et = EVIDENCE_TYPES[activeType];
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: '12px',
                      background: `${et.color}18`,
                      border: `1px solid ${et.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px',
                    }}>
                      {et.icon}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#f1f5f9' }}>
                      {et.type} Forensics
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {et.techniques.map((tech, idx) => (
                      <div key={tech.name} style={{
                        padding: '16px 20px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: et.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', fontWeight: 700, color: 'white', flexShrink: 0,
                          }}>
                            {idx + 1}
                          </div>
                          <h4 style={{ fontWeight: 700, fontSize: '13px', color: '#e2e8f0' }}>{tech.name}</h4>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>{tech.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 24px', maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="section-label">Common Questions</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#f1f5f9' }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ overflow: 'hidden', transition: 'all 0.3s ease' }}
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '18px 22px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#e2e8f0' }}>{item.q}</span>
                <span style={{ color: '#06b6d4', fontSize: '18px', flexShrink: 0, transition: 'transform 0.3s ease', transform: openFAQ === i ? 'rotate(45deg)' : 'none' }}>
                  +
                </span>
              </button>
              {openFAQ === i && (
                <div style={{ padding: '0 22px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, paddingTop: '14px' }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(6,182,212,0.03)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
            Ready to Verify Evidence?
          </h2>
          <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
            Upload your first file and see the power of multi-modal forensic AI.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/forensics" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                🔬 Analyze Evidence Free
              </button>
            </Link>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '15px 32px', fontSize: '16px' }}>
                About Crisis Guard →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
