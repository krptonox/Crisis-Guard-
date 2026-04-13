import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { uploadFile, analyzeWithAI, checkAIService } from '../../services/forensicsApi';

const STEPS = [
  { id: 1, icon: '📤', label: 'Uploading File' },
  { id: 2, icon: '🔐', label: 'Generating Hash' },
  { id: 3, icon: '🧬', label: 'Deepfake Analysis' },
  { id: 4, icon: '🧠', label: 'AI Assessment' },
  { id: 5, icon: '📋', label: 'Generating Report' },
];

const getFileType = (file) => {
  if (!file) return null;
  const { type, name } = file;
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type === 'application/pdf') return 'document';
  if (name.endsWith('.txt') || type === 'text/plain') return 'chat';
  return 'document';
};

const getFileTypeInfo = (file) => {
  if (!file) return null;
  const { type, name } = file;
  if (type.startsWith('image/')) return { label: 'Image', icon: '🖼️', color: '#8b5cf6' };
  if (type.startsWith('video/')) return { label: 'Video', icon: '🎥', color: '#06b6d4' };
  if (type === 'application/pdf') return { label: 'PDF Document', icon: '📄', color: '#f59e0b' };
  if (name.endsWith('.txt') || type === 'text/plain') return { label: 'Chat Export / Text', icon: '💬', color: '#22c55e' };
  return { label: 'Document', icon: '📁', color: '#94a3b8' };
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [aiOnline, setAiOnline] = useState(null); // null = checking
  const navigate = useNavigate();

  // Check AI service health on mount
  useEffect(() => {
    checkAIService().then(online => setAiOnline(online));
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const simulateSteps = async () => {
    for (let i = 1; i <= STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 700));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setCurrentStep(0);

    const fileType = getFileType(file);

    try {
      if (aiOnline) {
        // ── Path A: AI service is running — analyze directly ──────────────────
        const evidenceId = `ev_${Date.now()}`;
        const [result] = await Promise.all([
          analyzeWithAI(file, evidenceId, fileType),
          simulateSteps(),
        ]);
        // Store result in sessionStorage so the report page can pick it up
        sessionStorage.setItem(`ai_result_${evidenceId}`, JSON.stringify({
          ...result,
          evidenceId,
          fileName: file.name,
          fileType,
          fileSize: file.size,
          analyzedAt: new Date().toISOString(),
        }));
        navigate(`/forensics/report/${evidenceId}?source=ai`);
      } else {
        // ── Path B: AI service offline — fall back to Node.js backend ─────────
        const [response] = await Promise.all([uploadFile(file), simulateSteps()]);
        navigate(`/forensics/report/${response.evidenceId}`);
      }
    } catch (err) {
      console.error('Upload/analysis failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Analysis failed. Please try again.');
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const fileTypeInfo = getFileTypeInfo(file);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px' }}>

      {/* AI Service Status Badge */}
      {aiOnline !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          padding: '8px 14px', borderRadius: '10px', marginBottom: '16px',
          background: aiOnline ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${aiOnline ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
        }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
            background: aiOnline ? '#22c55e' : '#f59e0b',
            boxShadow: aiOnline ? '0 0 6px #22c55e' : '0 0 6px #f59e0b',
          }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: aiOnline ? '#86efac' : '#fcd34d' }}>
            AI Service {aiOnline ? 'Online — deepfake analysis active' : 'Offline — using backend fallback'}
          </span>
          {!aiOnline && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>
              Start: <code style={{ color: '#67e8f9', fontFamily: 'monospace' }}>cd ai-service &amp;&amp; python main.py</code>
            </span>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        style={{
          padding: '48px 32px', textAlign: 'center', cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? '#06b6d4' : 'rgba(255,255,255,0.12)',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          background: isDragActive ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.03)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <input {...getInputProps()} />
        {!file ? (
          <div>
            <div style={{ fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.4))' }}>
              {isDragActive ? '📂' : '🕵️'}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
              {isDragActive ? 'Drop file here' : 'Drop a file for deepfake detection'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>or click to browse from your device</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['🖼️ Images', '🎥 Videos', '📄 PDFs', '💬 Chat Exports'].map(label => (
                <span key={label} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '12px', color: '#94a3b8' }}>
                  {label}
                </span>
              ))}
            </div>
            <p style={{ color: '#334155', fontSize: '11px', marginTop: '16px' }}>Max file size: 100MB</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{fileTypeInfo?.icon}</div>
            <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '12px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9', wordBreak: 'break-all' }}>{file.name}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{formatSize(file.size)} • {fileTypeInfo?.label}</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: `${fileTypeInfo?.color}22`, color: fileTypeInfo?.color, border: `1px solid ${fileTypeInfo?.color}44`, fontWeight: 700, letterSpacing: '0.05em' }}>
                  {fileTypeInfo?.label}
                </span>
              </div>
            </div>
            {!loading && <p style={{ fontSize: '12px', color: '#475569' }}>Click or drag to replace this file</p>}
          </div>
        )}
      </div>

      {/* Analysis Progress Steps */}
      {loading && (
        <div style={{ marginTop: '16px', padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', textAlign: 'center', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {aiOnline ? '🧠 AI Deepfake Detection Running…' : 'Running Forensic Analysis…'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
            {STEPS.map((step) => {
              const done = currentStep > step.id;
              const active = currentStep === step.id;
              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', background: done ? 'rgba(34,197,94,0.2)' : active ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)', border: done ? '2px solid rgba(34,197,94,0.6)' : active ? '2px solid rgba(6,182,212,0.8)' : '2px solid rgba(255,255,255,0.08)', boxShadow: active ? '0 0 12px rgba(6,182,212,0.5)' : 'none', transition: 'all 0.4s ease' }}>
                    {done ? '✓' : step.icon}
                  </div>
                  <p style={{ fontSize: '9px', color: done ? '#22c55e' : active ? '#06b6d4' : '#334155', marginTop: '6px', textAlign: 'center', fontWeight: active || done ? 600 : 400, transition: 'all 0.3s ease' }}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      {file && !loading && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button onClick={() => setFile(null)} style={{ flex: '0 0 auto', padding: '12px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>
            ✕ Clear
          </button>
          <button onClick={handleUpload} style={{ flex: 1, padding: '14px', fontSize: '15px', letterSpacing: '0.02em', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            🕵️ Run Deepfake Detection
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <strong>Analysis Failed</strong>
            <p style={{ fontSize: '12px', color: '#f87171', marginTop: '2px' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      {!file && !loading && (
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { icon: '🧬', text: 'ELA + Noise + DCT analysis' },
            { icon: '🎭', text: 'Face & blinking deepfake check' },
            { icon: '📑', text: 'PDF structure & metadata check' },
            { icon: '💬', text: 'Chat timestamp forensics' },
          ].map(tip => (
            <div key={tip.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '14px' }}>{tip.icon}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{tip.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
