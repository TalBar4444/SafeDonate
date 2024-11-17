const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { checkCategory, getUserAgent, delay } = require('./scraperUtils')

puppeteer.use(StealthPlugin()); // Enable stealth mode

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
            const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            const page = await browser.newPage();

            const userAgent = getUserAgent();
            await page.setUserAgent(userAgent);

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
                    const contentEl = el.querySelector(".Hdw6tb");  // Snippet/content area
                    return {
                        title: titleEl ? titleEl.textContent : "No title found",
                        link: linkEl ? linkEl.href : "No link found",
                        content: contentEl ? contentEl.textContent : "No content found"
                    };
                });
            });

            // console.log(`Results befor filtering for keyword '${keyword}':`, searchResults);

            // Pass the scraped result for this keyword to the filtering function
            onScrapedResult(keyword, searchResults);

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
    return results;
};

// Run the scraping
module.exports = { scrapeData }