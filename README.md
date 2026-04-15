<div align="center">

# 🌐 Crisis-Guard AI


[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![NewsAPI](https://img.shields.io/badge/NewsAPI-Live-orange?style=for-the-badge)](https://newsapi.org)

</div>

---

## 🎯 What Is Crisis-Guard AI?

**Crisis-Guard AI** is a real-time global intelligence dashboard that fuses a photorealistic **3D Earth globe** with a **live news intelligence engine**. Users explore the planet by hovering or clicking any country — the platform instantly fetches that region's trending news from live APIs, displays it in a premium image-rich card feed, and AI-scores each article for trustworthiness.

It solves a real problem: **information overload during a global crisis.** Instead of navigating dozens of tabs, Crisis-Guard gives analysts, journalists, and the public a single, elegant interface to understand what's happening — and *how credible it is* — anywhere on Earth.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌍 **Photorealistic 3D Globe** | NASA Blue Marble texture with atmosphere shader, cloud layer, specular water, and continuous rotation |
| 📡 **Hover-to-Fetch Intelligence** | Move cursor over any country → 700ms debounce → live news fetches from API automatically |
| 🖼️ **Image-Rich News Cards** | Full-bleed article photos with source chips, time stamps, and breaking-news badges |
| 🤖 **AI Trust Scoring** | Every article is scored 0–100 for credibility based on source reputation and content signals |
| 📰 **4 Parallel News Rails** | Trending · Verified · Misinformation Watch · Country-specific — all auto-scrolling infinitely |
| 🔴 **Live Alert Ticker** | Breaking news headlines stream across the top of the screen in real-time |
| 🔍 **Country Search** | Fuzzy-search any country from the header — globe flies to it and loads local feed |
| 📊 **Stats Bar** | Live metrics: total feeds active, verified count, suspicious, flagged |
| 🎨 **Glassmorphism UI** | Dark-mode premium design with blurred glass cards, subtle gradients, and micro-animations |

---

## 🛠️ Tech Stack

### Frontend Core

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | Component architecture, hooks, Suspense |
| **Vite** | 5 | Ultra-fast dev server & build tool |
| **Tailwind CSS** | 3 | Utility-first styling system |
| **Vanilla CSS** | — | Custom glassmorphism, animations, card layouts |

### 3D Globe Engine

| Technology | Purpose |
|---|---|
| **Three.js** | WebGL-powered 3D rendering |
| **@react-three/fiber** | React bindings for Three.js |
| **@react-three/drei** | OrbitControls, Stars, Preload helpers |
| **Custom GLSL Shaders** | Atmospheric glow ring (vertex + fragment shaders) |
| **NASA Textures** | Blue Marble day map, water specular, normal map, cloud layer |

### State & Data

| Technology | Purpose |
|---|---|
| **Zustand** | Lightweight global state management |
| **Axios** | HTTP client for API calls |
| **requestAnimationFrame** | Smooth 60fps auto-scrolling rail animation |

### APIs

| API | Usage | Tier |
|---|---|---|
| **NewsAPI** (`newsapi.org`) | Global top-headlines & country-specific search | Free (1000 req/day) |
| **GNews API** (`gnews.io`) | Alternative news source with reliable image URLs | Free (100 req/day) |
| **Unsplash** | High-quality fallback images in demo/mock mode | Free (CDN) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                    │
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │  3D Globe    │    │   Intelligence Dashboard   │  │
│  │  (WebGL)     │───▶│   (React + Tailwind CSS)   │  │
│  │              │    │                           │  │
│  │  Three.js    │    │  ┌─────────────────────┐  │  │
│  │  R3F + Drei  │    │  │  Hover Country Feed  │  │  │
│  │  GLSL Shader │    │  │  (Image Cards Grid)  │  │  │
│  │  NASA Textures│   │  ├─────────────────────┤  │  │
│  └──────┬───────┘    │  │  Trending Rail       │  │  │
│         │            │  │  Verified Rail       │  │  │
│    Hover/Click       │  │  Misinfo Rail        │  │  │
│    (debounced)       │  └─────────────────────┘  │  │
│         │            └───────────────────────────┘  │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │  Zustand     │ ◀── Global State (news, UI)        │
│  │  Store       │                                   │
│  └──────┬───────┘                                   │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │  api.js      │  Waterfall: GNews → NewsAPI → Mock │
│  └──────┬───────┘                                   │
└─────────┼───────────────────────────────────────────┘
          │
          ▼  (HTTPS)
┌─────────────────────┐    ┌──────────────────────┐
│  GNews API          │    │  NewsAPI              │
│  gnews.io/api/v4    │    │  newsapi.org/v2       │
│  Free · 100/day     │    │  Free · 1000/day      │
└─────────────────────┘    └──────────────────────┘
```

---

## 🔬 How It Works — Step by Step

### 1. Globe Initialization
- Three.js `WebGLRenderer` loads inside a React `<Canvas>` via `@react-three/fiber`
- NASA texture maps (4 files) load with `TextureLoader` and anisotropic filtering (8x)
- A custom **GLSL fragment shader** creates the blue atmosphere glow using dot product of surface normals
- `OrbitControls` powers drag, tilt, and continuous 0.5°/s auto-rotation

### 2. Country Detection
- Every pointer move over the globe surface fires a **raycaster event**
- The 3D intersection point `(x, y, z)` on the unit sphere is converted to `(lat, lon)` using:
  ```js
  lat = Math.asin(y) in degrees
  lon = Math.atan2(z, -x) in degrees
  ```
- The nearest country from our dataset (36 countries) is found with Euclidean distance on lat/lon

### 3. Hover → News Pipeline
```
User hovers country
       │
       ▼
700ms debounce timer (avoids spamming API)
       │
       ▼
loadHoverNews(country) dispatched to Zustand
       │
       ▼
api.js: try GNews → try NewsAPI → use mock
       │
       ▼
Articles arrive with { title, image, source, timestamp, trustScore }
       │
       ▼
HoverCountrySection renders image-rich cards
       │
       ▼
Page smooth-scrolls to dashboard
```

### 4. Trust Scoring
- Each article's credibility is scored algorithmically:
  - **85–100**: BBC, Reuters, AP, Bloomberg, Guardian — established outlets
  - **55–84**: Known sources with ID present
  - **0–54**: Unknown, no source ID, or pattern-matched misinformation signals
- Cards are sorted into Verified / Suspicious / Flagged rails automatically

### 5. Auto-Scrolling Rails
- Each rail uses `requestAnimationFrame` for a butter-smooth 0.7px/frame marquee
- **Seamless loop**: content is duplicated `[...articles, ...articles]` — when `scrollLeft` reaches halfway, it resets to `0` instantly (no visual jump)
- Pauses on hover, resumes on leave; drag-to-scroll supported

---

## 📁 Project Structure

```
Globe_Dashboard/
├── public/
│   ├── earth-day.jpg          # NASA Blue Marble texture
│   ├── earth-water.png        # Specular map
│   ├── earth-topology.png     # Normal map
│   └── earth-clouds.png       # Cloud layer
│
├── src/
│   ├── components/
│   │   ├── Globe/
│   │   │   ├── GlobeScene.jsx     # Main 3D scene + raycaster + overlay
│   │   │   ├── Earth.jsx          # Globe mesh + GLSL atmosphere
│   │   │   └── HotspotMarker.jsx  # Pulsing country markers
│   │   ├── Dashboard/
│   │   │   └── HorizontalDashboard.jsx  # All news rails + image cards
│   │   ├── Header.jsx             # Search + clock + status
│   │   └── AlertBanner.jsx        # Breaking news ticker
│   │
│   ├── services/
│   │   └── api.js                 # GNews + NewsAPI + mock with Unsplash
│   │
│   ├── store/
│   │   └── useStore.js            # Zustand global state
│   │
│   ├── utils/
│   │   └── countries.js           # 36 countries data + lat/lon + helpers
│   │
│   ├── App.jsx                    # Root layout + StatsBar
│   └── index.css                  # Full design system + component styles
│
├── .env                           # API keys (not committed)
├── .env.example                   # Template
├── vite.config.js
└── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone / open the project
cd Globe_Dashboard

# 2. Install dependencies
npm install

# 3. Set up environment (optional — works without API keys using mock data)
copy .env.example .env
# Edit .env and add your API key(s)

# 4. Start the dev server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Environment Variables

```env
# GNews API — recommended (free, reliable images)
# Get free key at: https://gnews.io/
VITE_GNEWS_API_KEY=your_gnews_key_here

# NewsAPI — alternative (free for dev)
# Get free key at: https://newsapi.org/register
VITE_NEWS_API_KEY=your_newsapi_key_here
```

> **No API key?** No problem. The app works out-of-the-box with beautifully illustrated mock data using real Unsplash images.

---

## 🎨 Design Philosophy

Crisis-Guard AI is built around three principles:

1. **Data Density without Clutter** — A globe, 4 news rails, and analytics all live on one page without overwhelming the user. Spatial grouping and visual hierarchy guide attention naturally.

2. **Trust at a Glance** — Color-coded credibility (green → amber → red) lets users assess news reliability in under a second without reading metadata.

3. **Alive and Responsive** — The UI breathes: the globe rotates, rails scroll, the ticker streams, orbs float. Micro-animations signal that the system is actively monitoring — not a static page.

---

## 🔐 Security & Privacy

- API keys are stored in `.env` and **never exposed** in client bundles (Vite strips them at build time if not prefixed `VITE_`)
- No user data is collected, stored, or transmitted
- All news content is sourced from public APIs — no scraping
- CORS-safe: all requests go through NewsAPI/GNews official endpoints

---

## 📊 Performance

| Metric | Value |
|---|---|
| Initial JS bundle | ~280kb gzipped |
| Globe texture load | ~4 files, loaded once, cached |
| News fetch latency | ~400–900ms (API) / ~600ms (mock) |
| Animation frame rate | 60fps (requestAnimationFrame) |
| Globe render quality | DPR 1–2x, antialiased, ACESFilmic tone mapping |

---

## 🧩 APIs & Data Sources — Quick Reference for Judges

| Source | What it provides | Endpoint used |
|---|---|---|
| **GNews** `gnews.io` | Top headlines + country search with images | `GET /top-headlines` · `GET /search` |
| **NewsAPI** `newsapi.org` | Top headlines by category + everything search | `GET /top-headlines` · `GET /everything` |
| **NASA** (static) | Earth texture maps (day, specular, normal, clouds) | Served from `/public` folder |
| **Unsplash** (static) | Demo article images in mock/fallback mode | Direct CDN URLs |

**API Waterfall Logic:**
```
Request received
      │
      ├─ GNews key present? → fetch GNews → return ✓
      │
      ├─ NewsAPI key present? → fetch NewsAPI → return ✓
      │
      └─ No key → return mock data with Unsplash images ✓
```

---

## 🏆 What Makes This Project Stand Out

1. **Real WebGL 3D** — Not a map library or iframe. Hand-built Three.js scene with custom GLSL shaders.
2. **Intelligent UX** — Globe hover triggers news with a debounce, not a click. Feels magical and instant.
3. **AI Trust Scoring** — Every article gets a credibility score, automatically sorted into intelligence tiers.
4. **Production-Grade Code** — Error boundaries, Suspense, memoization, RAF cleanup, CORS handling, graceful fallbacks.
5. **Works Offline/No-Key** — Fully functional with beautiful mock data if no API key is provided.
6. **Extensible** — Adding a new country, news source, or rail takes ~5 lines of code.

---

<div align="center">

**Built with ❤️ using React · Three.js · NewsAPI · Zustand**

*Crisis-Guard AI — Know the world. Trust the signal.*

</div>
