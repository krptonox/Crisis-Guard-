import React from 'react';
import { Link } from 'react-router-dom';

const TECH_STACK = [
  { category: 'Frontend', color: '#06b6d4', items: ['React.js 18', 'Recharts', 'React Dropzone', 'jsPDF', 'React Router'] },
  { category: 'Backend', color: '#8b5cf6', items: ['Node.js + Express', 'FastAPI (Python)', 'Multer', 'Mongoose', 'Axios'] },
  { category: 'AI / ML', color: '#f59e0b', items: ['OpenCV', 'Pillow (PIL)', 'NumPy', 'scikit-learn', 'Ensemble Models'] },
  { category: 'Forensics', color: '#22c55e', items: ['Error Level Analysis', 'SHA-256 Hashing', 'EXIF Extraction', 'PDF Parser', 'Face Detection'] },
  { category: 'Data & Storage', color: '#ec4899', items: ['MongoDB', 'Redis Cache', 'IPFS (planned)', 'Blockchain Ledger'] },
  { category: 'DevOps', color: '#14b8a6', items: ['Docker', 'Docker Compose', 'Kubernetes (planned)', 'AWS S3 (planned)'] },
];

const ARCHITECTURE_LAYERS = [
  {
    label: 'Frontend Layer',
    items: ['File Upload UI', 'Evidence Dashboard', 'Forensic Report Viewer', 'PDF Download'],
    color: '#06b6d4',
    icon: '🖥️',
  },
  {
    label: 'API Gateway (Node.js)',
    items: ['Authentication', 'File Processing', 'Evidence Records', 'Health Monitoring'],
    color: '#8b5cf6',
    icon: '⚙️',
  },
  {
    label: 'AI Forensic Engine (FastAPI)',
    items: ['Image Module (ELA, Noise)', 'Video Module (Face, Sync)', 'Document Module (PDF, Sig)', 'Metadata Extractor'],
    color: '#f59e0b',
    icon: '🧠',
  },
  {
    label: 'Data Layer',
    items: ['MongoDB (Case Records)', 'Redis (Sessions)', 'Blockchain (Hashes)', 'File Storage'],
    color: '#22c55e',
    icon: '💾',
  },
];

const IMPACT_CASES = [
  {
    icon: '📱',
    title: 'WhatsApp Screenshot Fraud',
    scenario: 'A manipulated WhatsApp screenshot was submitted as evidence in a harassment case.',
    outcome: 'Crisis Guard detected timestamp region compression inconsistency and font anomaly. Confidence: 94.7% Tampered.',
    verdict: 'Tampered',
  },
  {
    icon: '🏦',
    title: 'Bank Statement Forgery',
    scenario: 'An edited PDF bank statement was submitted during a corporate arbitration.',
    outcome: 'PDF structure analysis revealed a second creation timestamp hidden in the object stream. Verdict flagged.',
    verdict: 'Suspicious',
  },
  {
    icon: '🎬',
    title: 'Deepfake CEO Video',
    scenario: 'A deepfake video of a CEO giving unauthorized instructions was circulated internally.',
    outcome: 'Blinking pattern analysis detected zero natural blinks in 40-second clip. Audio sync lag: 1.2s. 96% Tampered.',
    verdict: 'Tampered',
  },
  {
    icon: '📷',
    title: 'Alibi Photo Authentication',
    scenario: 'A defendant submitted photos claiming to prove their location at the time of incident.',
    outcome: 'EXIF GPS coordinates verified authentic. Camera model consistent. Timestamp metadata matched. Authentic.',
    verdict: 'Authentic',
  },
];

const About = () => {
  const getVerdictStyle = (verdict) => ({
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: verdict === 'Authentic' ? 'rgba(34,197,94,0.12)' : verdict === 'Suspicious' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
    color: verdict === 'Authentic' ? '#86efac' : verdict === 'Suspicious' ? '#fcd34d' : '#fca5a5',
    border: `1px solid ${verdict === 'Authentic' ? 'rgba(34,197,94,0.3)' : verdict === 'Suspicious' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
  });

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', paddingTop: '64px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <p className="section-label animate-fade-in-up">Our Mission</p>
        <h1
          className="animate-fade-in-up delay-100"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}
        >
          Democratizing{' '}
          <span style={{
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Digital Forensics
          </span>
        </h1>
        <p className="animate-fade-in-up delay-200" style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.8 }}>
          Crisis Guard was built to solve a critical gap: powerful digital forensics tools exist, but they're expensive, complex, and inaccessible to ordinary people who need them most — in harassment cases, fraud disputes, and family court proceedings.
        </p>
      </section>

      {/* Problem Statement */}
      <section style={{ padding: '60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '32px', borderTop: '2px solid rgba(239,68,68,0.4)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#fca5a5', marginBottom: '16px' }}>
              ❌ The Problem
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Deepfake videos submitted as courtroom evidence',
                'Fabricated WhatsApp screenshots win harassment cases',
                'Metadata tampering used to create false alibis',
                'AI-generated documents passed as authentic contracts',
                'Courts lack real-time verification capability',
                'FTK and EnCase cost $10,000+ per license',
              ].map(item => (
                <li key={item} style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
                  <span style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card" style={{ padding: '32px', borderTop: '2px solid rgba(34,197,94,0.4)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#86efac', marginBottom: '16px' }}>
              ✅ Our Solution
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Multi-modal analysis: images, video, docs, and chats',
                'Explainable AI — judges understand the reasoning',
                'Blockchain chain of custody — court-admissible',
                'Results in under 60 seconds, completely free',
                'No forensics expertise required',
                'Designed for cybercrime-specific evidence types',
              ].map(item => (
                <li key={item} style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
                  <span style={{ color: '#22c55e', marginTop: '2px', flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Real World Impact Cases */}
      <section style={{ padding: '80px 24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="section-label">Real-World Impact</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#f1f5f9' }}>
              Case Studies
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {IMPACT_CASES.map((c, i) => (
              <div key={c.title} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{c.icon}</span>
                  <span style={getVerdictStyle(c.verdict)}>{c.verdict}</span>
                </div>
                <h4 style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', fontSize: '15px' }}>{c.title}</h4>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>{c.scenario}</p>
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>
                    → {c.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="section-label">Engineering</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#f1f5f9' }}>
            System Architecture
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {ARCHITECTURE_LAYERS.map((layer, i) => (
            <div key={layer.label} style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
              {/* Arrow connector */}
              {i > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0', height: '24px' }}>
                  <div style={{ width: '2px', background: 'rgba(6,182,212,0.3)', margin: '0 auto' }} />
                </div>
              )}
            </div>
          ))}
          {ARCHITECTURE_LAYERS.map((layer, i) => (
            <div key={`layer-${i}`}>
              <div className="glass-card" style={{
                padding: '20px 24px',
                borderLeft: `3px solid ${layer.color}66`,
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{layer.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: layer.color, marginBottom: '8px', letterSpacing: '0.05em' }}>
                    {layer.label}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {layer.items.map(item => (
                      <span key={item} style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: `${layer.color}12`,
                        color: '#94a3b8',
                        border: `1px solid ${layer.color}22`,
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {i < ARCHITECTURE_LAYERS.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', height: '24px', alignItems: 'center' }}>
                  <div style={{ color: '#06b6d4', fontSize: '16px' }}>↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '80px 24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="section-label">Under the Hood</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#f1f5f9' }}>
              Technologies Used
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {TECH_STACK.map(ts => (
              <div key={ts.category} className="glass-card" style={{ padding: '24px', borderTop: `2px solid ${ts.color}44` }}>
                <h4 style={{ fontWeight: 700, color: ts.color, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                  {ts.category}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ts.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ts.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Standards */}
      <section style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p className="section-label">Legal & Compliance</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
          Built for Legal Admissibility
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.8, marginBottom: '48px' }}>
          Our forensic reports are designed to align with internationally recognized digital evidence standards.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
          {[
            { icon: '📜', title: 'ISO 27037', desc: 'Guidelines for identification, collection, acquisition, and preservation of digital evidence.' },
            { icon: '⛓️', title: 'Chain of Custody', desc: 'SHA-256 blockchain anchoring ensures tamper-evident evidence tracking from upload to court.' },
            { icon: '🧠', title: 'Explainable AI', desc: 'Every verdict includes human-readable reasoning, not just a binary classification output.' },
            { icon: '🔒', title: 'Data Privacy', desc: 'GDPR-aligned. Files are never stored permanently. Analysis occurs in isolated containers.' },
          ].map(item => (
            <div key={item.title} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{item.icon}</div>
              <h4 style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '6px', fontSize: '15px' }}>{item.title}</h4>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(to bottom, rgba(6,182,212,0.04), transparent)',
      }}>
        <blockquote style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(18px, 3vw, 28px)',
          fontWeight: 700,
          color: '#e2e8f0',
          maxWidth: '700px',
          margin: '0 auto 32px',
          lineHeight: 1.5,
        }}>
          "In cybercrime, the evidence itself is often the crime.{' '}
          <span style={{ color: '#06b6d4' }}>Our system ensures that when digital evidence enters the courtroom, truth enters with it.</span>"
        </blockquote>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
            🔬 Try Crisis Guard Free
          </button>
        </Link>
      </section>
    </div>
  );
};

export default About;
