function filterText(text) {
  return text.replace(/\(ע"ר\)/g, '').trim(); // Remove Hebrew registration mark   
}

function filterScrapedResults(results, associationName) {
  const uniqueResults = [];
  const seenLinks = new Set();

  for (const result of results) {
    const { title, link, content, keyword } = result;

    // Skip duplicate links or Guidestar links
    if (seenLinks.has(link) || 
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
    seenLinks.add(link);
  }

  return uniqueResults;
}

export { filterScrapedResults, filterText };



// function filterScrapedResults(results, associationName, filterName) {
//   const uniqueResults = [];
//   const seenLinks = new Set();

//   // Prepare association name variations for matching
//   const associationName = associationName || filterName;
//   // Filter out words shorter than 2 Hebrew characters
//   const nameWords = associationName.split(' ').filter(word => {
//     const hebrewChars = word.match(/[\u0590-\u05FF]/g);
//     return hebrewChars && hebrewChars.length > 2;
//   });
//   const exactName = associationName.trim();
//   console.log(exactName);

//   for (const result of results) {
//       let { title, link, content, keyword } = result;

//       // Skip duplicate links
//       if (seenLinks.has(link)) continue;

//       // Skip Guidestar links
//       if (link.includes('www.guidestar.org.il')) continue;

//       // Clean and normalize text for comparison
//       title = cleanTextForNLP(title);
//       content = cleanTextForNLP(content);

//       // Check for exact name match first (considering Hebrew text directionality)
//       const exactMatch = title.includes(exactName) || content.includes(exactName);

//       // If no exact match, check for partial matches with minimum word threshold
//       let wordMatchCount = 0;
//       if (!exactMatch) {
//         for (const word of nameWords) {
//           // Only consider Hebrew words
//           if (/[\u0590-\u05FF]/.test(word)) {
//             if (title.includes(word) || content.includes(word)) {
//               wordMatchCount++;
//             }
//           }
//         }
//       }

//       // Calculate keyword match score
//       let keywordScore = 0;
//       if (keyword) {
//         // Check for keyword in title (higher weight)
//         if (title.includes(keyword)) {
//           keywordScore += 0.4;
//         }
        
//         // Check for keyword in content
//         if (content) {
//           // Count keyword occurrences in content
//           const keywordRegex = new RegExp(keyword, 'g');
//           const keywordCount = (content.match(keywordRegex) || []).length;
//           // Add scaled score based on occurrences (max 0.3)
//           keywordScore += Math.min(0.3, keywordCount * 0.1);
          
//           // Check if keyword appears in first 200 characters (likely more relevant)
//           if (content.substring(0, 200).includes(keyword)) {
//             keywordScore += 0.2;
//           }
//         }
//       }

//       // Determine if result should be included based on matching criteria:
//       // 1. Exact match found OR
//       // 2. At least 60% of Hebrew name words found (for longer names) OR
//       // 3. At least 2 Hebrew words found (for shorter names)
//       const minWordMatches = Math.max(2, Math.ceil(nameWords.length * 0.6));
//       const shouldInclude = exactMatch || wordMatchCount >= minWordMatches;

//       if (!shouldInclude) continue;

//       // Calculate final confidence score combining name matching and keyword relevance
//       const nameMatchScore = exactMatch ? 1 : (wordMatchCount / nameWords.length);
//       const finalConfidence = nameMatchScore * 0.7 + keywordScore * 0.3;

//       // Create filtered result object with combined confidence score
//       const filteredResult = {
//         title,
//         link,
//         content,
//         keyword,
//         matchConfidence: finalConfidence
//       };

//       uniqueResults.push(filteredResult);
//       seenLinks.add(link);
//   }

//   // Sort results by match confidence
//   return uniqueResults.sort((a, b) => b.matchConfidence - a.matchConfidence);
// }

// function filterText(text) {
//   return text
//     .replace(/\(ע~ר\)/g, '') // Remove Hebrew registration mark
//     .replace(/[^a-zA-Z\u0590-\u05FF\s]/g, '') // Keep Hebrew chars, English letters, numbers and spaces
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// function cleanTextForNLP(text) {
//   if (!text) return '';
  
//   return text
//     // Remove dates and dashes (common in Hebrew text)
//     .replace(/^[^—]*—\s*/, '')
    
//     // Handle ellipsis properly - replace with period for sentence ending
//     .replace(/\.{3,}/g, '. ')
//     .replace(/…/g, '. ')
    
//     // Keep Hebrew chars, English letters, numbers, spaces and essential punctuation
//     .replace(/[^a-zA-Z\u0590-\u05FF\s\.\,\"]/g, ' ')
    
//     // Remove extra whitespace
//     .replace(/\s+/g, ' ')
    
//     // Clean up punctuation
//     .replace(/\.+/g, '.')
//     .replace(/\s+\./g, '.')
//     .replace(/\.\s+/g, '. ')
    
//     // Final trim
//     .trim();
// }

// export { replaceTildesAlgorithm, filterScrapedResults, filterText };
