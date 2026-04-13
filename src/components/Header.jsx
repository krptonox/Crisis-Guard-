import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { searchCountries } from '../utils/countries';

function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
      <span className="text-text-secondary">
        {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
      <span className="w-px h-3 bg-border" />
      <span className="text-accent counter tabular-nums">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
      <span className="text-text-muted">UTC</span>
    </div>
  );
}

export default function Header() {
  const { searchQuery, setSearchQuery, selectCountry } = useStore();
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (searchQuery.length > 1) {
      setSuggestions(searchCountries(searchQuery));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSelect = (country) => {
    selectCountry(country);
    setSearchQuery('');
    setSuggestions([]);
    inputRef.current?.blur();
    // Scroll to dashboard
    document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-overlay">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow-sm">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-text-primary">
              Crisis-Guard<span className="text-gradient-accent">&nbsp;AI</span>
            </div>
            <div className="text-[10px] text-text-muted leading-none tracking-widest uppercase">Intelligence Platform</div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="flex-1 max-w-md relative">
          <div className={`flex items-center gap-2.5 h-9 px-3.5 rounded-lg border transition-all duration-200 ${
            focused
              ? 'border-accent/50 bg-surface shadow-glow-sm'
              : 'border-border bg-surface/60'
          }`}>
            <svg className="w-3.5 h-3.5 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search country or region…"
              className="search-input text-sm"
              id="global-search"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && focused && (
            <div className="absolute top-full mt-1.5 left-0 right-0 glass-card border border-border/80 rounded-xl overflow-hidden z-50 animate-scale-in">
              {suggestions.map((c) => (
                <button
                  key={c.code}
                  onMouseDown={() => handleSelect(c)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-surface-hover transition-colors"
                >
                  <span className="text-lg">{c.flag}</span>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{c.name}</div>
                    <div className="text-xs text-text-muted">{c.code}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.crisis >= 4 ? 'text-danger bg-danger/10' :
                      c.crisis >= 3 ? 'text-suspicious bg-suspicious/10' :
                      'text-verified bg-verified/10'
                    }`}>
                      Crisis {c.crisis}/5
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Nav links (center) ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HeaderNavLink to="/" label="🌐 Globe" />
          <HeaderNavLink to="/forensics" label="🕵️ Deepfake Detection" />
          <HeaderNavLink to="/how-it-works" label="🛡️ How It Works" />
          <HeaderNavLink to="/about" label="ℹ️ About" />
        </nav>

        {/* ── Right: status + clock ── */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Live indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-verified">
            <div className="live-dot" />
            <span>LIVE</span>
          </div>

          {/* Signal strength visual */}
          <div className="hidden md:flex items-end gap-0.5 h-3.5">
            {[1,2,3,4].map((i) => (
              <div
                key={i}
                className="w-1 rounded-sm bg-accent/70"
                style={{ height: `${25 * i}%` }}
              />
            ))}
          </div>

          <ClockDisplay />
        </div>
      </div>
    </header>
  );
}

/* ── Reusable nav link with active state ── */
function HeaderNavLink({ to, label }) {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      style={{
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'all 0.2s',
        background: isActive ? 'rgba(6,182,212,0.12)' : 'transparent',
        color: isActive ? '#06b6d4' : '#64748b',
        border: isActive ? '1px solid rgba(6,182,212,0.25)' : '1px solid transparent',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </Link>
  );
}
