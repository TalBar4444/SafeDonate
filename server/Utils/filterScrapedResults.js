function filterResults(results, associationName) {
  const uniqueResults = [];
  const seenLinks = new Set();

  for (const result of results) {
      const { title, link, content } = result;

      // 1. Skip results with the same link
      if (seenLinks.has(link)) continue;

      // 2. Skip results with link that includes 'www.guidestar.org.il'
      if (link.includes('www.guidestar.org.il')) continue;

      // 3. Check if the association name appears in either title or content
      const associationInTitle = title && title.includes(associationName);
      console.log("associationInTitle: ",associationInTitle);
      const associationInContent = content && content.includes(associationName);
      console.log("associationInContent: ",associationInContent);

      if (!associationInTitle && !associationInContent) continue;

      // If all checks pass, add the result to unique results and mark the link as seen
      uniqueResults.push(result);
      seenLinks.add(link);
  }

  return uniqueResults;
}

export { filterResults };

// const filterResults = (results, associationName) => {
//   const uniqueResults = [];
//   const seenLinks = new Set();
//     return results.filter(result => {
//       if (uniqueLinks.has(result.link)) {
//         return false; // הקישור כבר קיים, נפסל
//       }
//       if (result.link.includes('//www.guidestar.org.il')) {
//         return false; // הקישור מכיל את המחרוזת המבוקשת, נפסל
//       }
//       // סינון לפי associationName
//       const nameMatch = result.title.includes(associationName) || 
//                        result.content.includes(associationName);
//       if (!nameMatch) {
//         return false;
//       }
//       uniqueLinks.add(result.link);
//       return true;
//     });
//   }

// module.exports = { filterResults }

