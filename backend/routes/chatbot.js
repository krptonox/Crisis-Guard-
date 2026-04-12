const express = require('express');
const router = express.Router();
const { extractIntent, generateResponse, hasGeminiKey } = require('../services/groqClient');
const { fetchRelevantNews } = require('../services/newsService');
const { computeTrustScore } = require('../services/trustScorer');

// Crisis mode keyword detector
const MODE_KEYWORDS = {
  war:      ['attack','missile','war','blast','bomb','terror','military','airstrike','troops','conflict','nuclear','soldier','ceasefire','invasion','strike'],
  disaster: ['flood','earthquake','cyclone','tsunami','landslide','fire','hurricane','tornado','volcano','drought','disaster','relief','evacuation','storm'],
  economic: ['bank collapse','market crash','currency','rbi','inflation','recession','stock market','economy','rupee','dollar','bitcoin','crypto','shutdown','collapse'],
};

const detectMode = (query, requestedMode) => {
  if (requestedMode && requestedMode !== 'auto' && requestedMode !== 'general') {
    return requestedMode;
  }
  const lower = query.toLowerCase();
  for (const [mode, keywords] of Object.entries(MODE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return mode;
  }
  return 'general';
};

/**
 * POST /api/chatbot/verify
 * Main chatbot endpoint — full verification pipeline
 */
router.post('/verify', async (req, res) => {
  const startTime = Date.now();

  try {
    const { query, mode: requestedMode = 'auto', history = [] } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return res.status(400).json({ error: 'Query must be at least 3 characters.' });
    }

    const cleanQuery = query.trim().slice(0, 300);

    // ── Step 1: Auto-detect crisis mode ────────────────────────────────────
    const mode = detectMode(cleanQuery, requestedMode);
    console.log(`[Chatbot] Query: "${cleanQuery}" | Mode: ${mode}`);

    // ── Step 2: Intent extraction (LLM or fallback) ─────────────────────────
    let intent;
    try {
      intent = await extractIntent(cleanQuery, mode);
    } catch (e) {
      intent = { claim: cleanQuery, entities: [], eventType: 'other', location: null, urgency: 'medium' };
    }

    // ── Step 3: Fetch live news ─────────────────────────────────────────────
    const searchQuery = intent.location
      ? `${cleanQuery} ${intent.location}`.trim()
      : cleanQuery;

    const newsResults = await fetchRelevantNews(searchQuery, mode);

    // ── Step 4: Compute trust score (rule-based, NOT LLM) ───────────────────
    const trustData = computeTrustScore(cleanQuery, newsResults, mode);

    // ── Step 5: Generate AI response (Gemini or article-based fallback) ─────
    let verdictText = trustData.verdict_text;
    try {
      // Pass full article data so Gemini/fallback can build real narrative
      const enrichedTrust = {
        ...trustData,
        sources: newsResults,
        articleSnippets: newsResults
          .filter(a => a.relevance > 0)
          .slice(0, 4)
          .map(a => `"${a.title}" — ${a.name}`)
          .join(' | '),
      };
      const llmResponse = await generateResponse(enrichedTrust, cleanQuery, mode);
      if (llmResponse && llmResponse.length > 20) {
        verdictText = llmResponse;
      }
    } catch (e) {
      console.warn('[Chatbot] LLM response failed:', e.message);
    }

    // ── Step 6: Build final response ────────────────────────────────────────
    const response = {
      claim: intent.claim || cleanQuery,
      answer: trustData.answer,
      confidence: trustData.confidence,
      risk: trustData.risk,
      mode,
      verdict_text: verdictText,
      sources: newsResults.slice(0, 5).map(s => ({
        name: s.name,
        url: s.url,
        title: s.title,
        description: s.description ? s.description.slice(0, 200) : null,
        publishedAt: s.publishedAt,
        credibility: s.credibility,
        relevance: s.relevance || 0,
      })),
      reasoning: trustData.reasoning,
      intent: {
        eventType: intent.eventType,
        location: intent.location,
        urgency: intent.urgency,
        entities: intent.entities,
      },
      meta: {
        queryTime: Date.now() - startTime,
        sourcesChecked: newsResults.length,
        avgSourceCredibility: trustData.avgCredibility,
        hasLLM: hasGeminiKey(),
        hasNewsAPI: !!process.env.NEWS_API_KEY,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`[Chatbot] Done in ${response.meta.queryTime}ms | Answer: ${response.answer} | Confidence: ${response.confidence}% | Risk: ${response.risk}`);
    res.json(response);

  } catch (err) {
    console.error('[Chatbot] Error:', err.message);
    res.status(500).json({
      error: 'Verification failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * GET /api/chatbot/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CrisisGuard Chatbot',
    modes: ['war', 'disaster', 'economic', 'general'],
    llm: hasGeminiKey() ? `Google Gemini (${process.env.GEMINI_MODEL || 'gemini-1.5-flash'})` : 'Fallback (rule-based — add GEMINI_API_KEY)',
    newsApi: process.env.NEWS_API_KEY ? 'NewsAPI connected' : 'Live RSS feeds (BBC, Al Jazeera, The Hindu, NDTV)',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/chatbot/modes
 * Returns available modes + keywords
 */
router.get('/modes', (req, res) => {
  res.json({
    modes: [
      { id: 'war',      emoji: '🔴', label: 'War Mode',      keywords: MODE_KEYWORDS.war.slice(0, 5) },
      { id: 'disaster', emoji: '🌊', label: 'Disaster Mode', keywords: MODE_KEYWORDS.disaster.slice(0, 5) },
      { id: 'economic', emoji: '📉', label: 'Economic Mode', keywords: MODE_KEYWORDS.economic.slice(0, 5) },
      { id: 'general',  emoji: '🟢', label: 'General Mode',  keywords: [] },
    ],
  });
});

module.exports = router;
