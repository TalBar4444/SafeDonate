const axios = require('axios');
const cheerio = require('cheerio');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const keywordDictionary = require('../models/keywordDictionary.js');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

puppeteer.use(StealthPlugin());

// Configuration object
const config = {
    maxConcurrent: 3,
    requestDelay: 2000,
    textLimit: 2000,
    timeout: 60000,
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
};

//let browser = null;
let currentUserAgentIndex = 0;

function checkCategory(category) {
    const trimmedCategory = category?.trim() || "כללי";
    const keywords = keywordDictionary[trimmedCategory];
    return keywords || keywordDictionary["כללי"];
}

function getNextHeaders() {
    const userAgent = config.userAgents[currentUserAgentIndex];
    currentUserAgentIndex = (currentUserAgentIndex + 1) % config.userAgents.length;
    
    return {
        'User-Agent': userAgent,
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    };
}

async function googleSearch(browser, query) {
    const page = await browser.newPage();
    const headers = getNextHeaders();
    await page.setExtraHTTPHeaders(headers);

    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=he`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: config.timeout });

        const results = await page.evaluate(() => {
            const searchResults = [];
            const resultElements = document.querySelectorAll('div.g');
       
            resultElements.forEach(el => {
                const titleEl = el.querySelector('h3');
                const linkEl = el.querySelector('a');

                if(titleEl && linkEl) {
                    const link = linkEl.href;
                    
                    if (!link.includes('www.guidestar.org.il') &&
                        !link.includes('data.gov.il') &&
                        !link.includes('www.gov.il') &&
                        !/.(pdf|docx|xls|xlsm|xlsx)$/.test(link)) {
                        searchResults.push({
                            title: titleEl?.innerText || '',
                            link: linkEl?.href || ''
                        });
                    }
                }                 
            });
            return searchResults;
        });

        return results;
    } catch (error) {
        console.error(`Error in Google search for query "${query}":`, error);
        return [];
    } finally {
        await page.close();
    }
}

async function scrapeUrl(browser, url) {
    let page = null;
    try {
        page = await browser.newPage();
        const headers = getNextHeaders();
        await page.setExtraHTTPHeaders(headers);

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: config.timeout 
        });

        const html = await page.content();
        const cleanedHtml = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
                               .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

        const dom = new JSDOM(cleanedHtml, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (article) {
            let textContent = article.textContent
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/\b(\d{1,3}\.){3}\d{1,3}\b/g, '')
                .replace(/\d+(\.\d+)?K views/g, '')
                .replace(/Chrome \d+(\.\d+){2}/g, '')
                .replace(/Windows \d+/g, '')
                .replace(/[^\u0590-\u05FF\w\s]|[\u200B-\u200D\uFEFF]/g, '')
                .replace(/●|[\u2000-\u206F]/g, '')
                .replace(/\s+/g, ' ').trim();

            if (textContent.length > config.textLimit) {
                textContent = textContent.slice(0, config.textLimit) + '...';
            }

            return { title: article.title || '', text: textContent || '' };
        }
        return null;
    } catch (error) {
        console.error(`Error scraping URL ${url}:`, error);
        return null;
    } finally {
        if (page) {
            try {
                await page.close();
            } catch (error) {
                console.error('Error closing page:', error);
            }
        }
    }
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

async function scrapeUrlsContent(browser, urls, keyword) {
    const contentResults = [];
    for (const url of urls) {
        // Scrape each URL's content and title
        const result = await scrapeUrl(browser, url);
        if (result) {
            contentResults.push({
                title: result.title,
                link: url,
                content: result.text,
                keyword
            });
        }
    }
    return contentResults;
}

async function scrapeData(associationName, associationNumber, category) {
    console.log('Starting search process...');
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--lang=he-IL,he'
        ]
    });

    try {

        const searchResults = new Map();  
        const keywords = checkCategory(category);
        
        const searchPromises = keywords.map(async (keyword, index) => {
            await sleep(index * config.requestDelay);
            const searchQuery = `"${associationName}" ${keyword}`;
            const results = await googleSearch(browser, searchQuery);
            searchResults.set(keyword, results);
        });

        await Promise.all(searchPromises);
            
        const allResults = [];
        for (const [keyword, results] of searchResults) {
            const urls = results.map(result => result.link);
            const chunks = chunkArray(urls, config.maxConcurrent); // Limit concurrency
            
            for (const chunk of chunks) {
                const chunkResults = await scrapeUrlsContent(browser, chunk, keyword);
                allResults.push(...chunkResults);
            }
        }

        return allResults.filter(res => !!res.title && !!res.content);
    } finally {
        await browser.close();
    }
}

// function processResults(results) {
//     const processedResults = [];
//     const seenLinks = new Set();

//     for (const [keyword, searchResults] of Object.entries(results.searchResults)) {
//         searchResults.forEach(result => {
//             if (!seenLinks.has(result.link)) {
//                 const contentResult = results.contentResults[result.link];
//                 processedResults.push({
//                     title: result.title || '',
//                     link: result.link || '',
//                     content: contentResult?.text || '',
//                     keyword
//                 });
//                 seenLinks.add(result.link);
//             }
//         });
//     }

//     return processedResults;
// }

module.exports = { scrapeData };