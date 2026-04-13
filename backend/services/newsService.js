const axios = require('axios');
const RSSParser = require('rss-parser');

const parser = new RSSParser({
  timeout: 8000,
  headers: { 'User-Agent': 'CrisisGuard/2.0 NewsBot' },
});

// ── Source credibility weights ───────────────────────────────────────────────
const SOURCE_CREDIBILITY = {
  'bbc.com': 88, 'bbc.co.uk': 88,
  'reuters.com': 92, 'apnews.com': 90,
  'aljazeera.com': 78, 'aljazeera.net': 78,
  'thehindu.com': 82, 'ndtv.com': 78,
  'hindustantimes.com': 75, 'timesofindia.indiatimes.com': 72,
  'theguardian.com': 80, 'nytimes.com': 82,
  'washingtonpost.com': 80, 'cnn.com': 72,
  'economictimes.indiatimes.com': 76, 'moneycontrol.com': 70,
  'pib.gov.in': 95, 'ndma.gov.in': 95,
  'rbi.org.in': 95, 'mea.gov.in': 90,
  'indianexpress.com': 78, 'wionews.com': 72,
  'firstpost.com': 68, 'news18.com': 68,
  'arabnews.com': 70, 'jpost.com': 70,
  'timesofisrael.com': 70, 'haaretz.com': 72,
  'tass.com': 60, 'rt.com': 45,
};

// ── Free RSS feeds (no API key required) ─────────────────────────────────────
const RSS_FEEDS = {
  // General / international
  general: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',         name: 'BBC World News',     credibility: 88 },
    { url: 'https://feeds.bbci.co.uk/news/rss.xml',               name: 'BBC News',            credibility: 88 },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml',           name: 'Al Jazeera',          credibility: 78 },
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', name: 'Times of India', credibility: 72 },
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories',   name: 'NDTV',                credibility: 78 },
    { url: 'https://www.thehindu.com/news/feeder/default.rss',    name: 'The Hindu',           credibility: 82 },
    { url: 'https://indianexpress.com/feed/',                     name: 'Indian Express',      credibility: 78 },
  ],
  // War / conflict
  war: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',         name: 'BBC World',           credibility: 88 },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml',           name: 'Al Jazeera',          credibility: 78 },
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', name: 'BBC Middle East', credibility: 88 },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', name: 'TOI World',    credibility: 72 },
    { url: 'https://www.thehindu.com/news/international/feeder/default.rss', name: 'The Hindu International', credibility: 82 },
    { url: 'https://wionews.com/world/rss',                        name: 'WION World',          credibility: 72 },
  ],
  // Disaster / natural
  disaster: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',         name: 'BBC World',           credibility: 88 },
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories',   name: 'NDTV',                credibility: 78 },
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', name: 'Times of India', credibility: 72 },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', name: 'The Hindu India', credibility: 82 },
    { url: 'https://indianexpress.com/feed/',                      name: 'Indian Express',      credibility: 78 },
  ],
  // Economic
  economic: [
    { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', name: 'Economic Times', credibility: 76 },
    { url: 'https://feeds.feedburner.com/moneycontrol-news',      name: 'Moneycontrol',        credibility: 70 },
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml',      name: 'BBC Business',        credibility: 88 },
    { url: 'https://www.thehindu.com/business/Economy/feeder/default.rss', name: 'Hindu Business', credibility: 82 },
    { url: 'https://indianexpress.com/section/business/economy/feed/', name: 'IE Economy',    credibility: 78 },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getDomain = (url) => {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url || 'unknown'; }
};

const getCredibility = (url) => {
  const domain = getDomain(url);
  for (const [key, score] of Object.entries(SOURCE_CREDIBILITY)) {
    if (domain.includes(key)) return score;
  }
  return 50;
};

/**
 * Score how relevant an article is to a query (0–1)
 */
const relevanceScore = (article, queryTerms) => {
  const text = [
    article.title || '',
    article.contentSnippet || article.description || '',
  ].join(' ').toLowerCase();

  let matches = 0;
  for (const term of queryTerms) {
    if (text.includes(term.toLowerCase())) matches++;
  }
  if (queryTerms.length === 0) return 0;
  const score = matches / queryTerms.length;
  // Strict matching: Must match more than 50% of the query terms to be considered relevant.
  // This prevents articles that only match a single generic word (e.g. "death") from being flagged as relevant.
  return score > 0.5 ? score : 0;
};

/**
 * Extract meaningful search terms from query
 */
const extractTerms = (query) => {
  const stopWords = new Set([
    'the','a','an','is','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','could','should',
    'may','might','shall','can','need','dare','ought','used','about',
    'tell','me','what','when','where','who','why','how','give','i',
    'news','update','latest','show','any','there','between','and','or',
    'of','in','to','for','with','on','at','from','into','through',
  ]);

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
};

/**
 * Fetch a single RSS feed
 */
const fetchFeed = async (feed) => {
  try {
    const parsed = await parser.parseURL(feed.url);
    return (parsed.items || []).slice(0, 15).map(item => ({
      title: item.title || '',
      url: item.link || item.guid || '',
      name: feed.name,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      description: item.contentSnippet || item.summary || item.content || '',
      credibility: feed.credibility || getCredibility(item.link || ''),
      source: feed.name,
    }));
  } catch (err) {
    // Feed fetch failed silently
    return [];
  }
};

/**
 * Fetch from NewsAPI (if key is set)
 */
const fetchFromNewsAPI = async (query, mode) => {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) return [];

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query.slice(0, 100),
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: NEWS_API_KEY,
      },
      timeout: 8000,
    });

    return (response.data.articles || []).map(a => ({
      title: a.title || '',
      url: a.url || '',
      name: a.source?.name || getDomain(a.url),
      publishedAt: a.publishedAt || new Date().toISOString(),
      description: a.description || '',
      credibility: getCredibility(a.url),
    }));
  } catch (err) {
    console.warn('[NewsAPI] Error:', err.message);
    return [];
  }
};

/**
 * Main: fetch relevant news for a query + mode
 */
const fetchRelevantNews = async (query, mode) => {
  const queryTerms = extractTerms(query);
  console.log(`[News] Query terms: [${queryTerms.join(', ')}] | Mode: ${mode}`);

  const feeds = RSS_FEEDS[mode] || RSS_FEEDS.general;

  // Fetch RSS feeds + NewsAPI in parallel
  const [rssResults, apiResults] = await Promise.all([
    Promise.all(feeds.map(f => fetchFeed(f))).then(arrays => arrays.flat()),
    fetchFromNewsAPI(query, mode),
  ]);

  let combined = [...apiResults, ...rssResults];

  // Filter & score by relevance
  // Enforce TRUSTED SOURCES ONLY (credibility >= 70)
  let scored = combined
    .filter(a => a.title && a.url && (a.credibility || 50) >= 70)
    .map(a => ({
      ...a,
      relevance: relevanceScore(a, queryTerms),
    }));

  // Separate: relevant articles + latest fallbacks
  const relevant = scored
    .filter(a => a.relevance > 0)
    .sort((a, b) => {
      // Sort by relevance first, then credibility, then recency
      const relDiff = b.relevance - a.relevance;
      if (Math.abs(relDiff) > 0.1) return relDiff;
      const credDiff = (b.credibility || 50) - (a.credibility || 50);
      if (Math.abs(credDiff) > 5) return credDiff;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

  const latestFallback = scored
    .filter(a => a.relevance === 0)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 3);

  // Merge: relevant first, then some recents to pad if needed
  let result = [...relevant];
  if (result.length < 3) result = [...result, ...latestFallback].slice(0, 5);

  // Deduplicate by URL
  const seen = new Set();
  result = result.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  console.log(`[News] Found ${result.length} articles (${relevant.length} relevant) for: "${query}"`);
  return result.slice(0, 6);
};

module.exports = { fetchRelevantNews, getCredibility, getDomain, extractTerms };
