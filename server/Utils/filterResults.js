function filterText(text) {
  return text.replace(/\(ע"ר\)/g, '').trim(); // Remove Hebrew registration mark   
}

function getNormalizedUrl(url) {
  try {
    // For telegram links, strip query parameters
    if (url.includes('t.me/')) {
      return url.split('?')[0];
    }
    
    // For other URLs, keep the full path but clean up common tracking parameters
    const cleanUrl = url
      .replace(/^@/, '')  // Remove leading @ if exists
      .replace(/\/+$/, '') // Remove trailing slashes
      .replace(/,00\.html$/, '.html'); // Clean up ynet-style endings
    
    return cleanUrl;
  } catch (error) {
    return url;
  }
}

function filterScrapedResults(results, associationName) {
  const uniqueResults = [];
  const seenUrls = new Set();

  for (const result of results) {
    const { title, link, content, keyword } = result;
    const normalizedUrl = getNormalizedUrl(link);

    // Skip duplicate normalized URLs or Guidestar/Facebook links
    if (seenUrls.has(normalizedUrl) || 
        link.includes('www.guidestar.org.il') || 
        link.includes('www.facebook.com')
    ) {
      continue;
    }

    // Skip if title contains only English or numbers
    const hasHebrewChars = /[\u0590-\u05FF]/.test(title);
    if (!hasHebrewChars) {
      continue;
    }

    if (title.length < 3) {
      continue;
    }
    if (content.length < 3) {
      continue;
    }

    const filteredResult = {
      title,
      link, 
      content,
      keyword
    };

    uniqueResults.push(filteredResult);
    seenUrls.add(normalizedUrl);
  }

  return uniqueResults;
}

export { filterScrapedResults, filterText };
