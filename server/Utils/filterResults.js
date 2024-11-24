/**
 * Removes Hebrew registration mark (ע"ר) from text and trims whitespace
 * Used to clean association names
 */
function filterText(text) {
  return text.replace(/\(ע"ר\)/g, '').trim();
}

/**
 * Normalizes URLs by removing tracking parameters and cleaning up common patterns
 * Handles special cases for Telegram links and standardizes URL formats
 */
function getNormalizedUrl(url) {
  try {
    if (url.includes('t.me/')) {
      return url.split('?')[0];
    }
    
    return url
      .replace(/^@/, '')
      .replace(/\/+$/, '')
      .replace(/,00\.html$/, '.html');
  } catch (error) {
    return url;
  }
}

/**
 * Filters and deduplicates scraped search results
 * Removes duplicates, filters out unwanted sources, and ensures content quality
 * Returns array of unique, valid results with Hebrew content
 */
function filterScrapedResults(results) {
  const uniqueResults = [];
  const seenUrls = new Set();

  for (const result of results) {
    const { title, link, content, keyword } = result;
    const normalizedUrl = getNormalizedUrl(link);

    // Skip if URL already seen or from excluded sources
    if (seenUrls.has(normalizedUrl) || 
        link.includes('guidestar.org.il') || 
        link.includes('facebook.com')) {
      continue;
    }

    // Validate content requirements
    if (!title || !content || 
        title.length < 3 || 
        content.length < 3 ||
        !/[\u0590-\u05FF]/.test(title)) {
      continue;  
    }

    uniqueResults.push({ title, link, content, keyword });
    seenUrls.add(normalizedUrl);
  }

  return uniqueResults;
}

export { filterScrapedResults, filterText };
