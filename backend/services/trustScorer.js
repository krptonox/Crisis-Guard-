/**
 * Trust Scorer — Computes confidence (0–100) and risk based on:
 *  - Source count & credibility
 *  - Relevance of articles to the specific query
 *  - Red/green signal keywords in content
 *  - Crisis mode context
 * NEVER uses LLM to decide truth — pure rule-based logic.
 */

const { extractTerms } = require('./newsService');

// Misinformation signals → reduce confidence
const RED_FLAGS = [
  'unconfirmed','rumour','rumor','alleged','claim','reportedly',
  'sources say','anonymous source','viral','whatsapp forward',
  'not verified','fake','hoax','misleading','satire','debunked',
  'false','denied','no evidence','unsubstantiated',
];

// Credibility signals → boost confidence
const GREEN_FLAGS = [
  'official statement','confirmed','government confirms','ministry',
  'press release','prime minister','president','foreign ministry',
  'spokesperson','announced','verified','fact check confirmed',
  'according to official','ministry of defence','official sources confirm',
  'state media','government spokesperson',
];

const MODE_CONFIG = {
  war:      { baseConfidence: 30, redPenalty: 14, greenBonus: 8,  multiplier: 0.82, baseRisk: 'High'   },
  disaster: { baseConfidence: 35, redPenalty: 12, greenBonus: 10, multiplier: 0.88, baseRisk: 'High'   },
  economic: { baseConfidence: 38, redPenalty: 10, greenBonus: 12, multiplier: 0.90, baseRisk: 'Medium' },
  general:  { baseConfidence: 42, redPenalty: 8,  greenBonus: 10, multiplier: 1.00, baseRisk: 'Low'    },
};

const clamp = (v, lo = 5, hi = 95) => Math.max(lo, Math.min(hi, Math.round(v)));

const avgCred = (sources) => {
  if (!sources?.length) return 0;
  return sources.reduce((s, a) => s + (a.credibility || 50), 0) / sources.length;
};

/**
 * Check how well articles actually match the query
 */
const computeRelevanceBoost = (sources, queryTerms) => {
  if (!sources?.length || !queryTerms?.length) return 0;
  const relevant = sources.filter(s => s.relevance > 0);
  if (relevant.length === 0) return -15; // No relevant articles found
  const avgRel = relevant.reduce((s, a) => s + (a.relevance || 0), 0) / relevant.length;
  return Math.round(avgRel * 25); // Max +25 for perfect relevance
};

/**
 * Determine answer
 */
const determineAnswer = (confidence, sources, mode) => {
  const relevantCount = sources.filter(s => s.relevance > 0).length;
  if (relevantCount === 0) return 'Unverified';
  if (confidence >= 62 && relevantCount >= 2) return 'Yes';
  if (confidence < 28) return 'No';
  if (mode === 'war' && confidence < 35) return 'No';
  return 'Unverified';
};

/**
 * Determine risk level
 */
const determineRisk = (confidence, mode, answer, relevantSourceCount) => {
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.general;
  if (answer === 'No') return mode === 'war' || mode === 'disaster' ? 'High' : 'Medium';
  if (relevantSourceCount === 0) return cfg.baseRisk;
  if (confidence >= 70) return 'Low';
  if (confidence >= 45) return 'Medium';
  return 'High';
};

/**
 * Build verdict text specific to mode + answer + query context
 */
const buildVerdict = (answer, confidence, risk, sources, mode, query) => {
  const relevantSrcs = sources.filter(s => s.relevance > 0);
  const count = relevantSrcs.length;
  const topSrc = relevantSrcs[0]?.name || sources[0]?.name || 'available sources';
  const shortQuery = query.length > 60 ? query.slice(0, 60) + '…' : query;

  const verdicts = {
    war: {
      Yes: `✅ Reports found regarding "${shortQuery}". ${count} relevant source(s) including ${topSrc}. Confidence: ${confidence}%. Cross-reference with official government statements before sharing.`,
      No: `🚨 High Risk Alert — No credible confirmation found for "${shortQuery}". Confidence of authenticity: ${confidence}%. This appears to be unverified or misinformation. Do NOT share without official source verification.`,
      Unverified: `⚠️ Claim under verification: "${shortQuery}". ${count} relevant article(s) found but insufficient official confirmation. Confidence: ${confidence}%. Await government or defence ministry statement.`,
    },
    disaster: {
      Yes: `🌊 Disaster event corroborated for "${shortQuery}". ${count} source(s) including ${topSrc} report this event. Confidence: ${confidence}%. Follow official NDMA/government advisories for safety guidance.`,
      No: `🚨 No verified disaster report found for "${shortQuery}" from NDMA, IMD, or official agencies. Confidence: ${confidence}%. Do not evacuate or share without official advisory.`,
      Unverified: `⚠️ Disaster claim "${shortQuery}" is unverified. ${count} partial report(s) found. Confidence: ${confidence}%. Monitor official NDMA / meteorological channels for updates.`,
    },
    economic: {
      Yes: `📊 Financial claim verified: "${shortQuery}". ${count} credible source(s) including ${topSrc} confirm this. Confidence: ${confidence}%. Always verify with RBI/SEBI before financial decisions.`,
      No: `⚠️ No RBI/SEBI or major financial outlet confirms "${shortQuery}". Confidence: ${confidence}%. This appears to be a financial rumour. Do not make investment/banking decisions based on this.`,
      Unverified: `📉 Financial claim "${shortQuery}" is unverified. ${count} source(s) found but no official confirmation. Confidence: ${confidence}%. Cross-check with RBI, SEBI, or Economic Times.`,
    },
    general: {
      Yes: `✅ Claim supported: "${shortQuery}". ${count} source(s) including ${topSrc} corroborate this. Confidence: ${confidence}%. Multi-source verification passed.`,
      No: `⚠️ Insufficient evidence for "${shortQuery}". Only ${count} vague source(s), ${confidence}% confidence. This claim may be misinformation or too early to confirm.`,
      Unverified: `🔍 Claim "${shortQuery}" is currently unverified. Found ${count} partial source(s). Confidence: ${confidence}%. Continue monitoring credible news outlets for updates.`,
    },
  };

  return (verdicts[mode]?.[answer]) || (verdicts.general[answer]);
};

/**
 * Build reasoning string
 */
const buildReasoning = (sources, confidence, redCount, greenCount, mode, queryTerms) => {
  const relevant = sources.filter(s => s.relevance > 0);
  const parts = [];

  parts.push(`${sources.length} article(s) fetched from live RSS feeds`);
  if (relevant.length > 0) {
    parts.push(`${relevant.length} matched your query keywords`);
  } else {
    parts.push('0 articles directly matched your query — showing closest available');
  }

  if (sources.length > 0) {
    const cred = Math.round(avgCred(sources));
    parts.push(`avg source credibility: ${cred}%`);
  }
  if (redCount > 0) parts.push(`${redCount} uncertainty signal(s) detected`);
  if (greenCount > 0) parts.push(`${greenCount} official confirmation signal(s)`);

  const modeNote = {
    war:      'War mode: strict filtering, official source priority',
    disaster: 'Disaster mode: real-time feed priority active',
    economic: 'Economic mode: financial source weighting applied',
    general:  'General mode: balanced multi-source verification',
  };
  parts.push(modeNote[mode] || '');

  return parts.filter(Boolean).join(' · ');
};

/**
 * Main trust scoring function
 */
const computeTrustScore = (query, newsResults, mode) => {
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.general;
  const sources = newsResults || [];
  const queryTerms = extractTerms(query);

  let confidence = cfg.baseConfidence;

  // 1. Source count adjustment
  const relevant = sources.filter(s => s.relevance > 0);
  if (sources.length === 0) {
    confidence -= 20;
  } else if (relevant.length === 0) {
    confidence -= 10; // sources found but not relevant to query
  } else if (relevant.length === 1) {
    confidence += 8;
  } else if (relevant.length >= 3) {
    confidence += 20;
  } else {
    confidence += 12;
  }

  // 2. Relevance boost — query-specific
  confidence += computeRelevanceBoost(sources, queryTerms);

  // 3. Source credibility
  const cred = avgCred(sources);
  if (cred > 85) confidence += 18;
  else if (cred > 70) confidence += 10;
  else if (cred > 55) confidence += 4;
  else if (cred < 40 && sources.length > 0) confidence -= 8;

  // 4. Red/green flag analysis across all fetched content
  const allText = [
    query,
    ...sources.map(s => `${s.title || ''} ${s.description || ''}`),
  ].join(' ');

  const redCount  = RED_FLAGS.filter(f => allText.toLowerCase().includes(f)).length;
  const greenCount = GREEN_FLAGS.filter(f => allText.toLowerCase().includes(f)).length;

  confidence -= redCount  * cfg.redPenalty;
  confidence += greenCount * cfg.greenBonus;

  // 5. Mode multiplier
  confidence = confidence * cfg.multiplier;

  // 6. Clamp
  confidence = clamp(confidence);

  // 7. Derive answer, risk, verdict
  const answer       = determineAnswer(confidence, sources, mode);
  const risk         = determineRisk(confidence, mode, answer, relevant.length);
  const verdict_text = buildVerdict(answer, confidence, risk, sources, mode, query);
  const reasoning    = buildReasoning(sources, confidence, redCount, greenCount, mode, queryTerms);

  return {
    answer,
    confidence,
    risk,
    verdict_text,
    reasoning,
    sourcesCount: sources.length,
    relevantCount: relevant.length,
    topSource: relevant[0]?.name || sources[0]?.name || null,
    avgCredibility: Math.round(cred),
  };
};

module.exports = { computeTrustScore };
