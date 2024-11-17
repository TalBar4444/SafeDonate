// Filter results where the associationNumber and keyword are found in the title or content
const processScrapedResults = (keyword, associationName, associationNumber, results) => {
    const filteredResults = results.filter(result => {
        const { title, content, link } = result;
        const isKeywordInTitleOrContent = title.includes(keyword) || content.includes(keyword);
        const isAssociationInTitleOrContent = title.includes(associationNumber) || content.includes(associationNumber);
        const isAssociationNameInTitleOrContent = title.includes(associationName) || content.includes(associationName);

        // Only approve results where both conditions are true
        return isKeywordInTitleOrContent && (isAssociationInTitleOrContent || isAssociationNameInTitleOrContent);
    });

    // console.log(`Results after Filtering for keyword '${keyword}':`, filteredResults);

    // Filter out duplicate links using a Set
    const uniqueLinks = new Set(filteredResults.map(result => result.link));
    const filteredResultsWithUniqueLinks = filteredResults.filter(result => uniqueLinks.has(result.link));

    // console.log(`Results after Filtering links for keyword '${keyword}':`, filteredResultsWithUniqueLinks);

    // Store the filtered results
    return {
        keyword,
        filteredResults: filteredResultsWithUniqueLinks
    };
}

module.exports = { processScrapedResults };





