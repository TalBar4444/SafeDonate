const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const { checkCategory, getUserAgent, delay } = require('./scraperUtils.js');

puppeteer.use(StealthPlugin());

// Create rate limiter instance
// Dynamically import `p-limit` to handle the ESM error
let limit;
(async () => {
    const pLimit = (await import('p-limit')).default;
    limit = pLimit(10); // Set concurrency limit
})();

// Helper function to clean and prepare text for ML models
const prepareTextForModels = (text) => {
    // Remove extra whitespace and normalize
    text = text.replace(/\s+/g, ' ').trim();
    // Truncate to 512 tokens (approximate by characters)
    return text.slice(0, 1500); // ~512 tokens assuming average token is 3 characters
};

// Helper function to extract content using Readability
const extractContent = (html) => {
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article ? prepareTextForModels(article.textContent) : 'No content found';
};

// Function to scrape data for a single keyword with retries
const scrapeKeyword = async (browser, associationNumber, keyword, retries = 2) => {
    const searchQuery = `"${associationNumber}" ${keyword}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    for (let attempt = 0; attempt < retries; attempt++) {
        const page = await browser.newPage();
        try {
            await page.setUserAgent(getUserAgent());
            await page.goto(searchUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000  // Set 20 second timeout here
            });
            
            if (await page.$('form[action="/sorry/index"]')) {
                console.warn(`CAPTCHA detected for keyword: "${keyword}" (attempt ${attempt + 1}/${retries})`);
                await delay(2000 * (attempt + 1)); // Exponential backoff
                continue;
            }

            const searchResults = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.g')).map((el) => ({
                    title: el.querySelector('h3')?.textContent || 'No title found',
                    link: el.querySelector('a')?.href || 'No link found',
                }));
            });

            await page.close();

            // Process each result with error handling
            const articles = await Promise.all(
                searchResults.map((result) =>
                    limit(async () => {
                        try {
                            const articlePage = await browser.newPage();
                            await articlePage.setUserAgent(getUserAgent());
                            await articlePage.goto(result.link, { waitUntil: 'domcontentloaded', timeout: 20000 });
                            
                            const content = await articlePage.content();
                            const extractedContent = extractContent(content);
                            
                            await articlePage.close();
                            return {
                                title: prepareTextForModels(result.title),
                                link: result.link,
                                content: extractedContent,
                                keyword, // Include keyword for context
                                timestamp: new Date().toISOString(),
                            };
                        } catch (error) {
                            console.error(`Failed to process article ${result.link}:`, error.message);
                            return null;
                        }
                    })
                )
            );

            return articles.filter(Boolean); // Filter out failed articles
        } catch (error) {
            console.error(`Error scraping keyword "${keyword}" (attempt ${attempt + 1}/${retries}):`, error.message);
            await page.close();
        }
    }
    return null; // Return null if all retries failed
};

// Main scraping function
const scrapeDataa = async (associationNumber, category, onScrapedResult) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disabled-setuid-sandbox',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--enable-features=NetworkService', // Improved networking
                '--disable-extensions', // Disable extensions for added security
            ],
        });

        const keywords = checkCategory(category);
        const results = [];
        
        // Process keywords in batches to prevent overwhelming
        const batchSize = 3;
        for (let i = 0; i < keywords.length; i += batchSize) {
            const batch = keywords.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(keyword => 
                    limit(() => scrapeKeyword(browser, associationNumber, keyword))
                )
            );
            
            const validResults = batchResults.flat().filter(Boolean);
            results.push(...validResults);
            
            // Notify progress
            onScrapedResult(validResults);
            
            // Add delay between batches
            if (i + batchSize < keywords.length) {
                await delay(2000);
            }
        }

        return results;
    } catch (error) {
        console.error('Fatal error during scraping:', error);
        throw error; // Rethrow to handle at higher level
    } finally {
        if (browser) {
            await browser.close();
            console.log('Scraping completed');
        }
    }
};

module.exports = { scrapeDataa };