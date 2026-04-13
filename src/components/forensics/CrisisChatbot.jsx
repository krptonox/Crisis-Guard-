import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Crisis Mode Config ───────────────────────────────────────────────────────
const MODES = {
  war: {
    id: 'war',
    label: 'War Mode',
    emoji: '🔴',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.35)',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    keywords: ['attack','missile','war','blast','bomb','terror','military','airstrike','troops','conflict','nuclear','soldier','ceasefire','invasion'],
    placeholder: 'Ask about military conflicts, attacks, border tensions...',
  },
  disaster: {
    id: 'disaster',
    label: 'Disaster Mode',
    emoji: '🌊',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    keywords: ['flood','earthquake','cyclone','tsunami','landslide','fire','hurricane','tornado','volcano','drought','disaster','relief','evacuation'],
    placeholder: 'Ask about natural disasters, emergency updates...',
  },
  economic: {
    id: 'economic',
    label: 'Economic Mode',
    emoji: '📉',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    keywords: ['bank collapse','market crash','currency','rbi','inflation','recession','stock','economy','rupee','dollar','bitcoin','crypto','collapse','shutdown'],
    placeholder: 'Ask about financial rumors, market news, banking...',
  },
  general: {
    id: 'general',
    label: 'General Mode',
    emoji: '🟢',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.35)',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
    keywords: [],
    placeholder: 'Ask about news, politics, viral claims...',
  },
};

// ─── Auto Detect Mode ─────────────────────────────────────────────────────────
const detectMode = (text) => {
  const lower = text.toLowerCase();
  for (const [id, mode] of Object.entries(MODES)) {
    if (id === 'general') continue;
    if (mode.keywords.some(kw => lower.includes(kw))) return id;
  }
  return 'general';
};

// ─── Risk Colors ─────────────────────────────────────────────────────────────
const riskStyle = {
  High:   { color: '#fca5a5', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'  },
  Medium: { color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  Low:    { color: '#86efac', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)'  },
};

// ─── Confidence Bar ───────────────────────────────────────────────────────────
const ConfidenceBar = ({ value }) => {
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Confidence</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 3,
          transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 4, padding: '6px 0', alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#06b6d4',
        animation: 'chatDotBounce 1.2s ease-in-out infinite',
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

// ─── Render verdict text with line breaks & bullets ───────────────────────────
const VerdictText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, margin: 0 }}>
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
        return (
          <div key={i} style={{
            marginBottom: i < lines.length - 1 ? 6 : 0,
            paddingLeft: isBullet ? 8 : 0,
            borderLeft: isBullet ? '2px solid rgba(6,182,212,0.4)' : 'none',
          }}>
            {line.trim()}
          </div>
        );
      })}
    </div>
  );
};

// ─── Response Card ────────────────────────────────────────────────────────────
const ResponseCard = ({ msg }) => {
  const { data } = msg;
  if (!data) return null;

  const risk = riskStyle[data.risk] || riskStyle.Low;
  const answerColor =
    data.answer === 'Yes' ? '#22c55e' :
    data.answer === 'No' ? '#ef4444' : '#f59e0b';

  const richSources = (data.sources || []).filter(s => s.title || s.name);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(6,182,212,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>
            {data.answer === 'Yes' ? '✅' : data.answer === 'No' ? '🚨' : '⚠️'}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: answerColor }}>
            {data.answer === 'Yes' ? 'Verified' :
             data.answer === 'No' ? 'Likely Misinformation' : 'Unverified'}
          </span>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, padding: '2px 10px',
          borderRadius: 20, border: `1px solid ${risk.border}`,
          background: risk.bg, color: risk.color,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {data.risk} Risk
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        <VerdictText text={data.verdict_text} />
        <ConfidenceBar value={data.confidence} />

        {richSources.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              fontSize: 10, color: '#64748b', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 6,
            }}>
              📰 Live Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {richSources.slice(0, 4).map((src, i) => (
                <a
                  key={i}
                  href={src.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', fontSize: 11,
                    textDecoration: 'none', padding: '7px 10px', borderRadius: 8,
                    background: (src.relevance || 0) > 0 ? 'rgba(6,182,212,0.07)' : 'rgba(255,255,255,0.03)',
                    border: (src.relevance || 0) > 0 ? '1px solid rgba(6,182,212,0.18)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: src.title ? 3 : 0 }}>
                    <span style={{ color: '#67e8f9', fontWeight: 600 }}>🔗 {src.name}</span>
                    <span style={{ color: '#334155', flexShrink: 0 }}>
                      {src.publishedAt ? new Date(src.publishedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {src.title && (
                    <div style={{
                      color: '#94a3b8', fontSize: 11, lineHeight: 1.4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {src.title}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {data.reasoning && (
          <div style={{
            marginTop: 10, fontSize: 11, color: '#475569',
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 6,
            borderLeft: '2px solid rgba(6,182,212,0.25)',
          }}>
            📊 {data.reasoning}
          </div>
        )}

        <div style={{ marginTop: 8, fontSize: 10, color: '#1e293b', textAlign: 'right' }}>
          {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const isWarning = msg.data?.answer === 'No';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      animation: 'chatMsgFadeIn 0.3s ease forwards',
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, marginRight: 8, marginTop: 2,
          boxShadow: '0 0 10px rgba(6,182,212,0.3)',
        }}>
          🛡️
        </div>
      )}

      <div style={{ maxWidth: '85%' }}>
        {isUser ? (
          <div style={{
            background: 'linear-gradient(135deg, #075985, #0e7490)',
            color: '#e0f7ff', padding: '10px 14px',
            borderRadius: '16px 16px 4px 16px',
            fontSize: 13, lineHeight: 1.5,
            boxShadow: '0 2px 8px rgba(6,182,212,0.15)',
          }}>
            {msg.content}
          </div>
        ) : msg.loading ? (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 14px',
            borderRadius: '16px 16px 16px 4px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <TypingDots />
            <span style={{ fontSize: 12, color: '#64748b' }}>🔍 Verifying in real-time...</span>
          </div>
        ) : (
          <div style={{
            background: isWarning ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
            border: isWarning ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px 16px 16px 4px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px 6px', fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
              {msg.content}
            </div>
            {msg.data && (
              <div style={{ padding: '0 10px 10px' }}>
                <ResponseCard msg={msg} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Chatbot Component ───────────────────────────────────────────────────
const CrisisChatbot = () => {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      content: "👋 I'm the Crisis Guard Intelligence Bot. I verify real-time crisis claims using live news & AI analysis. Ask me anything — I'll tell you what's verified, suspicious, or misinformation.",
      data: null,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [pulseAlert, setPulseAlert] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const mode = MODES[activeMode];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!open) {
        setPulseAlert(true);
        setTimeout(() => setPulseAlert(false), 2000);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [open]);

  // ── Verify Query via Backend (uses Vite proxy → /api/chatbot/verify) ────────
  const verifyQuery = useCallback(async (query, currentMode) => {
    try {
      const res = await fetch('/api/chatbot/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode: currentMode,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Chatbot API unavailable, using fallback:', err.message);
      return buildFallbackResponse(query, currentMode);
    }
  }, [messages]);

  // ── Client-side Fallback ────────────────────────────────────────────────────
  const buildFallbackResponse = (query, modeId) => {
    const confidence = Math.floor(Math.random() * 30) + 25;
    const risk = modeId === 'war' ? 'High' : modeId === 'economic' ? 'Medium' : 'Low';
    const verdictTexts = {
      war: `🚨 This claim requires verification through official defence/government channels. Real-time cross-referencing shows limited confirmation. Treat with high caution.`,
      disaster: `🌊 Checking NDMA and meteorological sources. Preliminary data is inconclusive — await official advisories before acting.`,
      economic: `📉 Financial claim detected. No official RBI/SEBI statement confirms this. Possible market rumour — verify before making decisions.`,
      general: `⚠️ This claim has limited source confirmation at this time. It may be unverified or still developing.`,
    };
    return {
      claim: query,
      answer: 'Unverified',
      confidence,
      risk,
      mode: modeId,
      verdict_text: verdictTexts[modeId] || verdictTexts.general,
      sources: [{ name: 'Start backend on :5000 for live sources', url: '#', publishedAt: new Date().toISOString() }],
      reasoning: `Backend API not reachable — showing fallback analysis. Start the Node.js backend for real-time verification.`,
      timestamp: new Date().toISOString(),
    };
  };

  // ── Send Message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const detected = detectMode(text);
    if (detected !== 'general' && detected !== activeMode) setActiveMode(detected);
    const currentMode = detected !== 'general' ? detected : activeMode;

    const userMsg = { id: Date.now(), role: 'user', content: text, data: null };
    const loadingMsg = { id: Date.now() + 1, role: 'bot', loading: true, content: '', data: null };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    const result = await verifyQuery(text, currentMode);

    const botMsg = {
      id: Date.now() + 2,
      role: 'bot',
      content: result.verdict_text || '⚠️ Analysis complete. See details below.',
      data: { ...result, verdict_text: null },
    };

    setMessages(prev => prev.map(m => m.loading ? botMsg : m));
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @keyframes chatDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatMsgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatWindowSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatBtnPulse {
          0%   { box-shadow: 0 0 0 0 rgba(6,182,212,0.7); }
          70%  { box-shadow: 0 0 0 14px rgba(6,182,212,0); }
          100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
        }
        @keyframes chatBtnPulseRed {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes diceSpin {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        .crisis-chat-input:focus { outline: none; border-color: rgba(6,182,212,0.5) !important; }
        .crisis-mode-btn:hover { opacity: 1 !important; }
        .crisis-send-btn:hover { transform: scale(1.08); }
        .crisis-send-btn:active { transform: scale(0.95); }
        .crisis-close-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .dice-spin { animation: diceSpin 5s infinite cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* ── Floating Action Button ── */}
      <button
        id="crisis-chatbot-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Open Crisis Guard Intelligence Bot"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: open ? 'linear-gradient(135deg, #334155, #1e293b)' : `linear-gradient(135deg, ${mode.color}, #0891b2)`,
          boxShadow: open ? '0 4px 20px rgba(0,0,0,0.4)' : `0 4px 24px ${mode.glow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          animation: pulseAlert && !open ? 'chatBtnPulse 1.5s ease-out' : (activeMode === 'war' && !open ? 'chatBtnPulseRed 2s ease-in-out infinite' : 'none'),
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        {open ? '✕' : (
          <svg className="dice-spin" width="34" height="34" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' }}>
            <g strokeLinejoin="round" strokeLinecap="round">
              <polygon points="50,15 85,35 50,55 15,35" fill="#5eead4" stroke="#5eead4" strokeWidth="8" />
              <polygon points="15,35 50,55 50,85 15,65" fill="#14b8a6" stroke="#14b8a6" strokeWidth="8" />
              <polygon points="50,55 85,35 85,65 50,85" fill="#0f766e" stroke="#0f766e" strokeWidth="8" />
            </g>
            <circle cx="50" cy="35" r="4.5" fill="white" />
            <circle cx="35" cy="27" r="4.5" fill="white" />
            <circle cx="65" cy="27" r="4.5" fill="white" />
            <circle cx="35" cy="43" r="4.5" fill="white" />
            <circle cx="65" cy="43" r="4.5" fill="white" />
            <circle cx="32" cy="50" r="4.5" fill="white" />
            <circle cx="32" cy="70" r="4.5" fill="white" />
            <circle cx="68" cy="50" r="4.5" fill="white" />
            <circle cx="68" cy="60" r="4.5" fill="white" />
            <circle cx="68" cy="70" r="4.5" fill="white" />
          </svg>
        )}
      </button>

      {/* Unread dot */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 78, right: 28, zIndex: 10000,
          width: 14, height: 14, borderRadius: '50%',
          background: '#ef4444', border: '2px solid #050b18',
          boxShadow: '0 0 6px rgba(239,68,68,0.6)',
        }} />
      )}

      {/* ── Chat Window ── */}
      {open && (
        <div
          id="crisis-chatbot-window"
          style={{
            position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
            width: 380, maxWidth: 'calc(100vw - 40px)',
            height: 580, maxHeight: 'calc(100vh - 130px)',
            borderRadius: 20,
            background: 'rgba(5, 11, 24, 0.97)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${mode.border}`,
            boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
            display: 'flex', flexDirection: 'column',
            animation: 'chatWindowSlideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', background: `linear-gradient(135deg, ${mode.bg}, rgba(255,255,255,0.02))`, borderBottom: `1px solid ${mode.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(6,182,212,0.4)' }}>
                  🛡️
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>Crisis Guard Bot</div>
                  <div style={{ fontSize: 11, color: mode.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 4px #22c55e' }} />
                    {mode.emoji} {mode.label} · Real-time Verification
                  </div>
                </div>
              </div>
              <button className="crisis-close-btn" onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#94a3b8', fontSize: 12, transition: 'background 0.2s' }}>✕</button>
            </div>

            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: 5, marginTop: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 4 }}>
              {Object.values(MODES).map(m => (
                <button key={m.id} className="crisis-mode-btn" onClick={() => setActiveMode(m.id)} title={m.label} style={{ flex: 1, padding: '5px 4px', border: activeMode === m.id ? `1px solid ${m.border}` : '1px solid transparent', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.2s', background: activeMode === m.id ? m.bg : 'transparent', color: activeMode === m.id ? m.color : '#475569', opacity: activeMode === m.id ? 1 : 0.7 }}>
                  {m.emoji} {m.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 4px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(6,182,212,0.3) transparent' }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${mode.border}`, background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#334155', marginBottom: 6 }}>⚡ Mode auto-detects from your query keywords</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                className="crisis-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={mode.placeholder}
                rows={1}
                disabled={loading}
                style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color 0.2s', maxHeight: 80, opacity: loading ? 0.6 : 1 }}
              />
              <button className="crisis-send-btn" onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', background: loading || !input.trim() ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${mode.color}, #8b5cf6)`, color: 'white', fontSize: 17, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: loading || !input.trim() ? 'none' : `0 0 12px ${mode.glow}` }}>
                {loading ? '⏳' : '↑'}
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#334155', textAlign: 'center' }}>
              Powered by Crisis Guard · Live RSS news
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrisisChatbot;
