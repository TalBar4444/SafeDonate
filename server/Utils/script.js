const axios = require('axios');
const cheerio = require('cheerio');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const puppeteer = require('puppeteer-extra'); // Updated for puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // Added Stealth Plugin
const keywordDictionary = require('../models/keywordDictionary.js');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

puppeteer.use(StealthPlugin());

function checkCategory (category) {
    const trimmedCategory = category?.trim() || "כללי";
    const keywords = keywordDictionary[trimmedCategory];

    if (!keywords) {
        return keywordDictionary["כללי"];
    }
    return keywords
};

class HebrewSearchScraper {
    constructor(options = {}) {
        this.maxConcurrent = options.maxConcurrent || 3;
        this.requestDelay = options.requestDelay || 2000;
        this.textLimit = options.textLimit || 2000;
        this.timeout = options.timeout || 30000;

           // List of realistic user agents
           this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        this.currentUserAgentIndex = 0;
        this.headers = this.getNextHeaders();    
        this.results = new Map();
        this.browser = null;
        this.skippedUrls = new Set();
		this.uniqueLinks = new Set();
       
    }

    getNextHeaders() {
        // Rotate to next user agent
        const userAgent = this.userAgents[this.currentUserAgentIndex];
        this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % this.userAgents.length;
        
        return {
            'User-Agent': userAgent,
            'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--lang=he-IL,he'
            ]
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async performSearch(associationName, keywords) {
      
		console.log('Starting search process...');
		const searchResults = new Map();  

		// Process keywords in parallel with rate limiting
		const searchPromises = keywords.map(async (keyword, index) => {
			// Add delay between searches
			await sleep(index * this.requestDelay);
			const searchQuery = `"${associationName}" ${keyword}`;
			const results = await this.googleSearch(searchQuery);
			searchResults.set(keyword, results);
		});

        await Promise.all(searchPromises);
            
		// Process all unique URLs found
		//const uniqueUrls = new Set();
		searchResults.forEach(results => {
			results.forEach(result => {
				if (
					!result.link.includes('www.guidestar.org.il') &&
					!result.link.includes('https://data.gov.il') &&
					!result.link.includes('www.gov.il') &&
					!result.link.endsWith('.pdf') && 
					!result.link.endsWith('.docx') &&
					!result.link.endsWith('.xls')			
				) {
					this.uniqueLinks.add(result.link);
				}
			});
		});

		// Scrape content from each unique URL
		const contentResults = await this.scrapeUrlsContent(Array.from(this.uniqueLinks));

		return {
			searchResults: Object.fromEntries(searchResults),
			contentResults
		};

        // } catch (error) {
        //     console.error('Error in search process:', error);
        //     throw error;
        // }
    }

    async googleSearch(query) {
        const page = await this.browser.newPage();
        const headers = this.getNextHeaders();
        await page.setExtraHTTPHeaders(headers);

        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=he`;
            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: this.timeout });

            // Wait for search results to load
            //await page.waitForSelector('div.g', { timeout: this.timeout });

            // Extract search results
            const results = await page.evaluate(() => {
                const searchResults = [];
                const resultElements = document.querySelectorAll('div.g');

                resultElements.forEach(el => {
                    const titleEl = el.querySelector('h3');
                    const linkEl = el.querySelector('a');

					if(titleEl && linkEl) {
						const link = linkEl.href;
						if (
							!link.includes('www.guidestar.org.il') &&
							!link.includes('https://data.gov.il') &&
							!link.includes('www.gov.il') &&
							!link.endsWith('.pdf') &&
							!link.endsWith('.docx') &&
							!link.endsWith('.xls')
						) {
							searchResults.push({
								title: titleEl.innerText || '',
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

    async scrapeUrlsContent(urls) {
        const contentResults = new Map();
        const chunks = this.chunkArray(urls, this.maxConcurrent);

        for (const chunk of chunks) {
            const scrapePromises = chunk.map(url => this.scrapeUrl(url));
            const results = await Promise.all(scrapePromises);
            
            results.forEach((result, index) => {
                if (result) {
                    contentResults.set(chunk[index], result);
                } else {
                    this.skippedUrls.add(chunk[index]);
                }
            });

            // Add delay between chunks
            await sleep(this.requestDelay);
        }

        return Object.fromEntries(contentResults)
          
    }

    async scrapeUrl(url) {
        let page = null;
        try {
            page = await this.browser.newPage();
            const headers = this.getNextHeaders();
            await page.setExtraHTTPHeaders(headers);

            // Set request interception to avoid loading unnecessary resources
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Set timeout for navigation
            await page.goto(url, { 
                waitUntil: 'networkidle0',
                timeout: this.timeout 
            });

            const html = await page.content();
            //await page.close();

            // Strip out <style> and <script> tags from HTML
            const cleanedHtml = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')	// Remove style blocks
                                    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ''); // Remove script blocks

            const dom = new JSDOM(cleanedHtml, { url }); // JSDOM requires the URL for correct parsing
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            if (article) {
                let textContent = article.textContent
                    .replace(/<!--[\s\S]*?-->/g, '')                     // Remove HTML comments
                    .replace(/\b(\d{1,3}\.){3}\d{1,3}\b/g, '')
					.replace(/\d+(\.\d+)?K views/g, '')
					.replace(/Chrome \d+(\.\d+){2}/g, '')
					.replace(/Windows \d+/g, '')
					.replace(/[^\u0590-\u05FF\w\s]|[\u200B-\u200D\uFEFF]/g, '')
					.replace(/●|[\u2000-\u206F]/g, '')
					.replace(/\s+/g, ' ').trim();                         // Clean up whitespace
                    

                if (textContent.length > this.textLimit) {
                    textContent = textContent.slice(0, this.textLimit) + '...';
                }

                return { title: article.title || '', text: textContent || '' };
            } else {
                console.warn(`Readability couldn't extract content from ${url}`);
                return null;
            }

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

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

   // Modify the final results processing to filter out duplicate links
	async processResults(results) {
		const processedResults = [];
		const seenLinks = new Set(); // To track links we've already processed

		for (const [keyword, searchResults] of Object.entries(results.searchResults)) {
			searchResults.forEach(result => {
				if (!seenLinks.has(result.link)) { // Check if the link is already in the set
					const contentResult = results.contentResults[result.link];
					processedResults.push({
						title: result.title || '',
						link: result.link || '',
						content: contentResult?.text || '',
						keyword
					});
					seenLinks.add(result.link); // Add the link to the seen set
				}
			});
		}

		return processedResults;
	}
}

async function main(associationName, associationNumber, category) {
    const keywords = checkCategory(category);

    const scraper = new HebrewSearchScraper({
        maxConcurrent: 3,
        requestDelay: 2000,
        textLimit: 3000
    });

    try {
        await scraper.init();
        const results = await scraper.performSearch(associationName, keywords);
        
        // שמירת התוצאות לקובץ
        const fs = require('fs').promises;
        await fs.writeFile(
            'search-results.json', 
            JSON.stringify(results, null, 2),
            'utf8'
        );

		const processedResults = await scraper.processResults(results);

        const analysisData = {
            results: processedResults,
            associationName,
            associationNumber
        };

        console.log('Analysis Data:', analysisData);
        console.log('Search completed successfully');

    } catch (error) {
        console.error('Search process failed:', error);
    } finally {
        await scraper.close();
    }
}

main("העמותה האיסלאמית למען יתומים ונזקקים (ע~ר)", 580288470, "דת").catch(console.error);