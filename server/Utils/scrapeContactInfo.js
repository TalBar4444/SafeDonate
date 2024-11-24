const puppeteer = require('puppeteer');
const cheerio = require("cheerio");

/**
 * Scrapes contact information for an association from Guidestar website
 * Extracts website, email, phone numbers and address if available
 * Returns object with available contact details
 */
const fetchContactInfo = async (associationNumber) => {
    const url = `https://www.guidestar.org.il/organization/${associationNumber}/contact`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('.malkar-contact-section', { timeout: 5000 }).catch(() => null);
        
        const data = await page.content();
        const $ = cheerio.load(data);

        const websiteLink = $(".malkar-contact-web .malkar-contact-section a[href^='http']").first().attr("href");
        const emailLink = $(".malkar-contact-info .malkar-contact-detail a[href^='mailto']").first().attr("href");
        
        const phoneNumbers = [];
        $(".malkar-contact-phone-num-wrapper .malkar-contact-detail.malkar-contact-phone a[href^='tel']").each((index, element) => {
            const phoneNumber = $(element).text().trim();
            if (phoneNumber && /^[\d\-+\s()]+$/.test(phoneNumber)) {
                phoneNumbers.push(phoneNumber);
            }
        });

        const fullAddress = $(".malkar-contact-detail.ng-star-inserted")
            .not(".malkar-contact-phone")
            .text()
            .trim();

        await browser.close();

        const contactInfo = {};

        if (websiteLink && websiteLink.startsWith('http')) {
            contactInfo.website = websiteLink;
        }

        if (emailLink && emailLink.includes('@')) {
            contactInfo.email = emailLink.replace("mailto:", "").trim();
        }

        if (phoneNumbers.length > 0) {
            contactInfo.phoneNumbers = phoneNumbers;
        }

        if (fullAddress && fullAddress.length > 0) {
            contactInfo.address = fullAddress;
        }

        return contactInfo;

    } catch (error) {
        console.error('Error fetching association contact:', error);
        await browser.close();
        throw error;
    }
};

module.exports = { fetchContactInfo };