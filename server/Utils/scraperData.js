const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { checkCategory, getUserAgent, delay } = require('./scraperUtils')

puppeteer.use(StealthPlugin());

/**
 * Scrapes Google search results for information about an association
 * Uses stealth mode and rotating user agents to avoid detection
 * Searches with multiple keywords based on association category
 * Handles CAPTCHA detection and implements delays between requests
 * Returns array of search results with titles, links and content
 */
const scrapeData = async (associationName, filterName, category) => {
    const results = [];
    let browser;

    const keywords = checkCategory(category);

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disabled-setuid-sandbox", "--no-sandbox"],
        });

        for (const keyword of keywords) {
            const searchQuery = `"${associationName}" OR "${filterName}" ${keyword}`;
            const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            const page = await browser.newPage();

            const userAgent = getUserAgent();
            await page.setUserAgent(userAgent);

            await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

            const isCaptcha = await page.$('form[action="/sorry/index"]');
            if (isCaptcha) {
                console.warn("CAPTCHA detected, skipping this keyword.");
                await page.close();
                continue;
            }

            const searchResults = await page.evaluate((keyword) => {
                return Array.from(document.querySelectorAll(".g")).map((el) => {
                    const titleEl = el.querySelector("h3");
                    const linkEl = el.querySelector('a');
                    const contentEl = el.querySelector(".VwiC3b")
                    
                    return {
                        title: titleEl ? titleEl.textContent : '',
                        link: linkEl ? linkEl.href : '',
                        content: contentEl ? contentEl.textContent : '',
                        keyword: keyword
                    };
                });
            }, keyword);
            
            results.push(...searchResults);

            await page.close();
            await delay(Math.random() * 2000 + 3000);
        }
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log("finish scraping")
        }
    }
    return results;
};

module.exports = { scrapeData }