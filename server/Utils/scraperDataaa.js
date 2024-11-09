const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { checkCategory, getUserAgent, delay } = require('./scraperUtils');
const cheerio = require('cheerio');
const axios = require('axios');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');


puppeteer.use(StealthPlugin()); // Enable stealth mode

// Helper function to extract article content
const extractArticleContent = async (url) => {
    try {
        // Add random delay between requests
        await delay(Math.floor(Math.random() * 3000) + 1000);

        const { data } = await axios.get(url, {
            headers: {
                'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
                'User-Agent': getUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: status => status < 500
        });

        // Handle potential redirects
        if (data.includes('meta http-equiv="refresh"')) {
            const redirectUrl = data.match(/URL='(.+?)'/i)?.[1];
            if (redirectUrl) {
                await delay(1000);
                return extractArticleContent(redirectUrl);
            }
        }

                // Remove all style and script tags before creating the DOM
        const cleanHtml = data
            .replace(/<style[^>]*>.*?<\/style>/gs, '')
            .replace(/<script[^>]*>.*?<\/script>/gs, '');
        
        
        // Create a DOM object from the HTML
        const dom = new JSDOM(cleanHtml, { 
            url,
            runScripts: "outside-only",
            resources: "usable"
        });
        
        // Wait for any dynamic content
        await delay(500);
        
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        
        return article ? cleanExtractedContent(article.textContent) : 'No content found';
    } catch (error) {
        console.error(`Error extracting content from ${url}:`, error.message);
        if (error.response?.status === 429) {
            // If rate limited, wait and retry
            await delay(5000);
            return extractArticleContent(url);
        }
        return '';
    }
};

const cleanExtractedContent = (text) => {
    if (!text || typeof text !== 'string') return null;
    
    return text
        // Remove CSS and font-face declarations
        .replace(/@font-face\{[^}]+\}/g, '')
        // Remove font-family declarations
        .replace(/font-family:[^;]+;/g, '')
        // Remove URLs
        .replace(/url\([^)]+\)/g, '')
        // Remove file extensions and paths
        .replace(/\.(eot|woff2?|ttf|svg)(#\w+)?/g, '')
        // Remove extra whitespace and normalize
        .replace(/\s+/g, ' ')
        .trim();
};


// Function to prepare text for models by cleaning and normalizing
const prepareTextForModels = (text) => {
    // Remove extra whitespace and normalize
    text = text.replace(/\s+/g, ' ').trim();
    // Truncate to 512 tokens (approximate by characters)
    return text.slice(0, 1500); // ~512 tokens assuming average token is 3 characters
    // return text
    //     .trim()
    //     .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Function to filter and validate search results
const isValidResult = (result) => {
    return result.title && 
           result.title !== "No title found" && 
           result.title !== "undefined" &&
           result.link && 
           result.link !== "No link found";
};

// Function to remove duplicates based on link
const removeDuplicates = (results) => {
    const seen = new Set();
    return results.filter(result => {
        if (seen.has(result.link)) {
            return false;
        }
        seen.add(result.link);
        return true;
    });
};

// Function to scrape Google search results for a given association number and keywords
const scrapeData = async (associationNumber, category, onScrapedResult) => {
    const results = [];
    let browser;

    const keywords = checkCategory(category);

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disabled-setuid-sandbox", "--no-sandbox"],
        });

        for (const keyword of keywords) {
            const searchQuery = `"${associationNumber}" ${keyword}`;
            //const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&hl=he`;
            const page = await browser.newPage();

            const userAgent = getUserAgent();
            await page.setUserAgent(userAgent);
            
            // Set Hebrew language preference
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
            });

            // Navigate to the Google search page and wait for content to load
            await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

            const isCaptcha = await page.$('form[action="/sorry/index"]');
            if (isCaptcha) {
                console.warn("CAPTCHA detected, skipping this keyword.");
                await page.close();
                continue; // Skip this keyword if CAPTCHA is encountered
            }

            // Scrape the search results from the page
            const searchResults = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".g")).map((el) => {
                    const titleEl = el.querySelector("h3");  // Titles inside <h3> tags
                    const linkEl = el.querySelector('a');    // Links inside <a> tags
                    //const contentEl = el.querySelector(".Hdw6tb");  // Snippet/content area
                    return {
                        title: titleEl ? titleEl.textContent : "No title found",
                        link: linkEl ? linkEl.href : "No link found",
                        //content: contentEl ? contentEl.textContent : "No content found"
                    };
                });
            });

            // Filter valid results and remove duplicates
            const validResults = searchResults.filter(isValidResult);
            const uniqueResults = removeDuplicates(validResults);

            // Process each valid and unique result to extract full content
            for (const result of uniqueResults) {
                const extractedContent = await extractArticleContent(result.link);
                const processedResult = {
                    title: prepareTextForModels(result.title),
                    link: result.link,
                    content: extractedContent,
                    keyword,
                };
                results.push(processedResult);
            }

            // Pass the scraped result for this keyword to the filtering function
            //onScrapedResult(keyword, uniqueResults);
            // Pass the processed results for this keyword
            onScrapedResult(results);

            // Close the page after each search
            await page.close();

            // Random delay to mimic human browsing and avoid detection
            await delay(Math.random() * 2000 + 3000); // Wait between 3-5 seconds
        }
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log("finish scraping")
        }
    }
    //return results;
    return removeDuplicates(results);
};

module.exports = { scrapeData };