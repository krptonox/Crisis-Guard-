const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Gemini Config ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL   = process.env.GEMINI_MODEL || 'gemini-1.5-flash'; // free tier

let genAI  = null;
let model  = null;

const initGemini = () => {
  if (!GEMINI_API_KEY) return false;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  }
  return true;
};

const hasGeminiKey = () => !!GEMINI_API_KEY && GEMINI_API_KEY.length > 10;

/**
 * Raw call to Gemini API
 */
const callGemini = async (prompt, maxTokens = 400) => {
  if (!initGemini()) throw new Error('GEMINI_API_KEY not set');

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  });

  return result.response.text().trim();
};

/**
 * Extract structured intent from the user query (what is being claimed/asked)
 */
const extractIntent = async (query, mode) => {
  if (!hasGeminiKey()) return extractIntentFallback(query, mode);

  try {
    const prompt = `You are a crisis intelligence analyst. Extract structured data from this crisis/news query.

User query: "${query}"
Crisis mode: ${mode}

Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "claim": "the core factual claim being verified",
  "entities": ["key names, places, organizations mentioned"],
  "eventType": "conflict|disaster|financial|political|crime|other",
  "location": "location if mentioned, else null",
  "urgency": "high|medium|low"
}`;

    const raw = await callGemini(prompt, 300);
    // Strip markdown code blocks if Gemini wraps in ```json
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('No JSON found in Gemini response');
  } catch (err) {
    console.warn('[Gemini] Intent extraction failed:', err.message);
    return extractIntentFallback(query, mode);
  }
};

/**
 * Generate a natural language response from verified backend data.
 * Gemini ONLY writes the text — all truth comes from our verification pipeline.
 */
const generateResponse = async (verificationResult, originalQuery, mode) => {
  if (!hasGeminiKey()) return generateResponseFallback(verificationResult, mode, originalQuery);

  try {
    // Build article context from actual fetched news
    const relevantArticles = (verificationResult.sources || [])
      .filter(s => (s.relevance || 0) > 0)
      .slice(0, 5);

    const articleContext = relevantArticles.length > 0
      ? relevantArticles.map((s, i) =>
          `${i + 1}. "${s.title}" — ${s.name} (${new Date(s.publishedAt).toLocaleDateString()})\n   ${s.description ? s.description.slice(0, 180) : ''}`
        ).join('\n\n')
      : 'No directly relevant articles found in live news feeds right now.';

    const prompt = `You are Crisis Guard — a real-time crisis intelligence system.

TASK: Write a factual 3-4 sentence analysis of the user's query, based ONLY on the live news articles below.

STRICT RULES:
1. Only use facts from the article headlines and descriptions provided.
2. Do NOT invent or speculate beyond what the articles say.
3. Reference specific article details (outlets, events mentioned).
4. State confidence (${verificationResult.confidence}%) and risk level (${verificationResult.risk}) explicitly.
5. Crisis mode: ${mode.toUpperCase()} — adjust tone accordingly.
6. Verdict from verification system: ${verificationResult.answer}

==== USER QUERY ====
"${originalQuery}"

==== LIVE NEWS ARTICLES (from BBC, Al Jazeera, The Hindu, NDTV etc.) ====
${articleContext}

==== VERIFICATION STATS ====
Articles scanned: ${verificationResult.sourcesCount}
Relevant matches: ${verificationResult.relevantCount}
Confidence: ${verificationResult.confidence}%
Risk: ${verificationResult.risk}
============================

Write a 3-4 sentence factual analysis now, referencing what the news articles actually report:`;

    const response = await callGemini(prompt, 250);
    console.log('[Gemini] ✅ Response generated successfully');
    return response;
  } catch (err) {
    console.warn('[Gemini] Response generation failed:', err.message);
    return generateResponseFallback(verificationResult, mode, originalQuery);
  }
};

// ── Fallbacks (when no API key) ───────────────────────────────────────────────

const extractIntentFallback = (query, mode) => {
  const lower = query.toLowerCase();
  const locationList = [
    'delhi','mumbai','india','pakistan','china','usa','assam','kerala','gujarat',
    'ukraine','russia','israel','gaza','iran','taiwan','kashmir','bengaluru',
    'hyderabad','london','washington','beijing','tehran','jerusalem','kyiv',
    'lahore','karachi','dhaka','colombo','kathmandu','singapore','tokyo',
  ];
  const foundLocation = locationList.find(l => lower.includes(l)) || null;

  const eventMap = {
    attack: 'conflict', missile: 'conflict', bomb: 'conflict',
    blast: 'conflict', war: 'conflict', strike: 'conflict',
    troops: 'conflict', military: 'conflict', ceasefire: 'conflict',
    flood: 'disaster', earthquake: 'disaster', cyclone: 'disaster',
    tsunami: 'disaster', landslide: 'disaster', wildfire: 'disaster',
    bank: 'financial', market: 'financial', crash: 'financial',
    rupee: 'financial', stock: 'financial', inflation: 'financial',
    election: 'political', vote: 'political', parliament: 'political',
  };
  const foundEvent = Object.entries(eventMap).find(([kw]) => lower.includes(kw));

  return {
    claim: query,
    entities: query.split(/\s+/).filter(w => w.length > 4).slice(0, 5),
    eventType: foundEvent ? foundEvent[1] : 'other',
    location: foundLocation,
    urgency: mode === 'war' ? 'high' : mode === 'disaster' ? 'high' : 'medium',
  };
};

const generateResponseFallback = (result, mode, query = '') => {
  const {
    answer, confidence, risk,
    sourcesCount = 0, relevantCount = 0,
    sources = [], articleSnippets = ''
  } = result;

  const shortQuery = query.length > 70 ? query.slice(0, 70) + '…' : query;

  // Pull actual article titles for narrative
  const relevantArticles = (sources)
    .filter(s => (s.relevance || 0) > 0)
    .slice(0, 3);

  const articleLines = relevantArticles.length > 0
    ? relevantArticles.map(a =>
        `• ${a.title ? a.title.slice(0, 100) : a.name}${a.description ? ' — ' + a.description.slice(0, 120) : ''}`
      ).join('\n')
    : null;

  const modeEmoji = { war: '🚨', disaster: '🌊', economic: '📉', general: '🔍' };
  const emoji = modeEmoji[mode] || '⚠️';

  if (answer === 'Yes' && articleLines) {
    return `${emoji} Based on ${relevantCount} live news source(s) for "${shortQuery}":

${articleLines}

Confidence: ${confidence}% · Risk: ${risk}. Cross-reference with official government sources before acting on this information.`;
  }

  if (answer === 'No') {
    const prefix = {
      war: '🚨 High Risk Alert — No official confirmation found.',
      disaster: '🌊 No verified disaster report from official agencies.',
      economic: '📉 No official RBI/SEBI confirmation for this claim.',
      general: '⚠️ Insufficient evidence found for this claim.',
    };
    const noText = articleLines
      ? `\n\nRelated coverage found:\n${articleLines}`
      : '';
    return `${prefix[mode] || '⚠️'} Query: "${shortQuery}"
Confidence: ${confidence}% · Risk: ${risk}${noText}

Do not share without verification from official sources.`;
  }

  // Unverified
  if (articleLines) {
    return `⚠️ Claim "${shortQuery}" is currently unverified (${confidence}% confidence, ${risk} risk).

What news sources currently report:
${articleLines}

Await official confirmation before sharing or acting on this information.`;
  }

  return `⚠️ "${shortQuery}" — Confidence: ${confidence}% · Risk: ${risk}. ${sourcesCount} source(s) scanned, ${relevantCount} matched. No directly relevant articles found in current feeds. Monitor BBC, Al Jazeera, or official government channels for updates.`;
};

module.exports = { extractIntent, generateResponse, hasGeminiKey };
