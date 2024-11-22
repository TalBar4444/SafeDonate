const { scrapeData } = require('../utils/scraperDataa.js');
const { filterScrapedResults, filterText } = require('../utils/filterResults.js');
const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
const { flaskAPIBaseUrl } = require("./../config");
const axios = require("axios");


const scrapeOnline = async (req, res) => {
    const { associationName, associationNumber, category } = req.body;
    const filterName = filterText(associationName);
    console.log('Starting scraping process for association number:',associationName, associationNumber, category);

    try {
        const allResults = await scrapeData(associationName, filterName, category);
        console.log("allResults: ", allResults);
       
       const filteredResults = filterScrapedResults(allResults);

       console.log("filteredResults: ", filteredResults);

        // Get filter from Flask server
        const analyzeResults = await generateAnalyzer({
            results: filteredResults,
            associationName,
            filterName,
            associationNumber
        });
        console.log('Analyze Results:', analyzeResults);
        
        return res.status(200).json(analyzeResults);

    } catch (error) {
        console.error('Error scraping online data:', error.message);
        return res.status(500).json({ error: 'Failed to scrape data' });
    }
}

// Function to get analysis from Flask server
const generateAnalyzer = async (data) => {
    try {
        const flaskAPIUrl = `${flaskAPIBaseUrl}/analyze`;
        const response = await axios.post(flaskAPIUrl, data);
        
        // Extract analysis results from response
        return response.data;

    } catch (err) {
        console.error("Error processing data:", err);
        throw new Error("Failed to analyze content: " + err.message);
    }
};

const getContactInfo = async (req, res) => {
    const { associationNumber } = req.body;
    try {
        const contactInfo = await fetchContactInfo(associationNumber);       
        if (!contactInfo) {
            return res.status(200).json({ 
                message: "No contact information available for this association",
                contactInfo: null 
            });
        }

        console.log('Contact Information:', contactInfo.address);
        return res.status(200).json({ contactInfo });

    } catch (error) {
        console.error('Error fetching contact info:', error);
        return res.status(500).json({ 
            error: 'Failed to retrieve contact information',
            details: error.message
        });
    }
}

module.exports = { getContactInfo, scrapeOnline };

// const { scrapeData } = require('../utils/scraperDataa.js');
// const { filterScrapedResults, filterText } = require('../utils/filterResults.js');
// const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
// const { flaskAPIBaseUrl } = require("./../config");
// const axios = require("axios");


// const scrapeOnline = async (req, res) => {
//     const { associationName, associationNumber, category } = req.body;
//     const filterName = filterText(associationName);
//     console.log("filterName:", filterName);
//     console.log('Starting scraping process for association number:',associationName, associationNumber, category);

//     try {
//         const allResults = await scrapeData(filterName, category);
//         console.log("allResults: ", allResults);
       
//        const filteredResults = filterScrapedResults(allResults, associationName,filterName);

//         const finalResults = {
//             results: filteredResults,
//             filterName,
//             associationNumber
//         }
//        console.log("finalResults: ", finalResults);

//         // Get filter from Flask server
//         const analyzeResults = await generateAnalyzer({
//             results: finalResults,
//             filterName,
//             associationNumber
//         });
//         console.log('Analyze Results:', analyzeResults);
        
//         //return res.status(200).json({ analyzeResults });
//         return res.status(200).json({ 
//             allResults: filteredResults,
//             analyzeResults 
//         });

//     } catch (error) {
//         console.error('Error scraping online data:', error.message);
//         return res.status(500).json({ error: 'Failed to scrape data' });
//     }
// }

// // Function to get analysis from Flask server
// const generateAnalyzer = async (data) => {
//     try {
//         const flaskAPIUrl = `${flaskAPIBaseUrl}/analyze`;
//         const response = await axios.post(flaskAPIUrl, data);
        
//         // Extract analysis results from response
//         const { analysis_results } = response.data;
//         return {analysis_results};

//     } catch (err) {
//         console.error("Error processing data:", err);
//         throw new Error("Failed to analyze content: " + err.message);
//     }
// };

// const getContactInfo = async (req, res) => {
//     const { associationNumber } = req.body;
//     try {
//         const contactInfo = await fetchContactInfo(associationNumber);       
//         if (!contactInfo) {
//             return res.status(200).json({ 
//                 message: "No contact information available for this association",
//                 contactInfo: null 
//             });
//         }

//         console.log('Contact Information:', contactInfo.address);
//         return res.status(200).json({ contactInfo });

//     } catch (error) {
//         console.error('Error fetching contact info:', error);
//         return res.status(500).json({ 
//             error: 'Failed to retrieve contact information',
//             details: error.message
//         });
//     }
// }

// module.exports = { getContactInfo, scrapeOnline };

// const { scrapeData } = require('../utils/scraperDataa.js');
// const { filterScrapedResults, filterText } = require('../utils/filterResults.js');
// const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
// const { flaskAPIBaseUrl } = require("./../config");
// const axios = require("axios");

// const scrapeOnline = async (req, res) => {
//     const { associationName, associationNumber, category } = req.body;

//     console.log('Starting scraping process for association number:', associationName, associationNumber, category);

//     try {
//         const allResults = DUMMY_RESULTS.allResults;
//         const assocName = "הפועל בני אשדוד (ע~ר)";
//         const assocNumber = 580592137;
//         console.log("allResults: ", allResults);

//         // Get filter from Flask server
//         const analyzeResults = await generateAnalyzer({
//             results: allResults,
//             assocName,
//             assocNumber,
//         });
//         console.log('Analyze Results:', analyzeResults);
        
//         return res.status(200).json({ analyzeResults });

//     } catch (error) {
//         console.error('Error scraping online data:', error.message);
//         return res.status(500).json({ error: 'Failed to scrape data' });
//     }
// }

// // Function to get analysis from Flask server
// const generateAnalyzer = async (data) => {
//     try {
//         const flaskAPIUrl = `${flaskAPIBaseUrl}/analyze`;
//         const response = await axios.post(flaskAPIUrl, data);
        
//         // Extract analysis results from response
//         const { analysis_results } = response.data;
//         return {analysis_results};

//     } catch (err) {
//         console.error("Error processing data:", err);
//         throw new Error("Failed to analyze content: " + err.message);
//     }
// };

// const getContactInfo = async (req, res) => {
//     const { associationNumber } = req.body;
//     try {
//         const contactInfo = await fetchContactInfo(associationNumber);       
//         if (!contactInfo) {
//             return res.status(200).json({ 
//                 message: "No contact information available for this association",
//                 contactInfo: null 
//             });
//         }

//         console.log('Contact Information:', contactInfo.address);
//         return res.status(200).json({ contactInfo });

//     } catch (error) {
//         console.error('Error fetching contact info:', error);
//         return res.status(500).json({ 
//             error: 'Failed to retrieve contact information',
//             details: error.message
//         });
//     }
// }

// module.exports = { getContactInfo, scrapeOnline };

// const DUMMY_RESULTS = {
//     allResults: [
//         {
//             title: 'פלילי',
//             link: 'https://ashdodnet.com/%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%90%D7%A9%D7%93%D7%95%D7%93/%D7%93%D7%95%D7%97-%D7%A4%D7%9C%D7%99%D7%9C%D7%99?Year=2020&Month=1',       
//             content: 'שוחרר למעצר בית השוטר מאשדוד שנעצר בחשד שקיבל שוחד ... הפועל בני אשדוד רדף אחרי שחקן הקבוצה היריבה. אחרי הדיווח על אירוע האלימות ...',
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'החצר האחורית של הכדורגל: לא ברור אם זה מגרש כדורגל או חוף ים',
//             link: 'https://ashdodi.com/%D7%94%D7%97%D7%A6%D7%A8-%D7%94%D7%90%D7%97%D7%95%D7%A8%D7%99%D7%AA-%D7%A9%D7%9C-%D7%94%D7%9B%D7%93%D7%95%D7%A8%D7%92%D7%9C-%D7%9C%D7%90-%D7%91%D7%A8%D7%95%D7%A8-%D7%90%D7%9D-%D7%96%D7%94-%D7%9E/',
//             content: '21 במאי 2023 — מרוב חול לא רואים את הדשא: בקבוצת הפועל בני אשדוד ניסו במהלך הימים האחרונים, לפני משחקם האחרון בליגה מול מיתר, להעביר את המפגש למקום אחר.',   
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'מעצר',
//             link: 'https://ashdodnet.com/mobile/Search?Text=%D7%9E%D7%A2%D7%A6%D7%A8&Page=7',
//             content: '... שוחד. בבית משפט השלום בראשל"צ הוארך מעצרו של עובד שירות התעסוקה, בשנות ה-60 לחייו, שנעצר בחשד לקבלת שוחד ... הפועל בני אשדוד התעמת עם שחקן קבוצה יריבה מגדרה, קרא ...',
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'חנן פדידה, אלירן זראי וחיים כנאפו קרובים לסיכום בהפועל אשדוד',
//             link: 'https://www.goler1.co.il/Article/9193',       
//             content: 'יש הפועל בני אשדוד ויש עוצמה של 1957 (הפועל עולה 05-08-2015, 13:48). מרכז ... השחיתות חוגגת ניגוד עניינים יצחק מואיל החקירות שלך ושל אורנשטיין בדרך תחפו ...',
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'העיר שלהם: קבוצת הנערים של הפועל אשדוד דרסה את עירוני',
//             link: 'https://ashdodi.com/%D7%94%D7%A2%D7%99%D7%A8-%D7%A9%D7%9C%D7%94%D7%9D-%D7%A7%D7%91%D7%95%D7%A6%D7%AA-%D7%94%D7%A0%D7%A2%D7%A8%D7%99%D7%9D-%D7%A9%D7%9C-%D7%94%D7%A4%D7%95%D7%A2%D7%9C-%D7%90%D7%A9%D7%93%D7%95%D7%93-%D7%93/',
//             content: '17 בספט׳ 2022 — עירוני שהביסה את הנערים של הפועל בני אשדוד במחזור הפתיחה בתוצאה 7:1, קיוותה להשיג שלוש נקודות גם בדרבי מול היריבה העירונית האדומה השנייה, אך ...',
//             keyword: 'שחיתות'
//           },
//           {
//             title: "ליגה ב' דרום ב': נתיבות והפועל אשדוד בפלייאוף, גדרה תשחק ...",
//             link: 'http://goler.co.il/Article/25116',
//             content: '1 באפר׳ 2023 — הפועל בני אשדוד ניצחה בירושלים את בית"ר נורדיה ירושלים 1:0 משער של מאיר אדרי ששלח את קבוצתו למשחקי הפלייאוף. מ.כ שדרות אמנם ניצחה 1:3 את ...',
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'Kaduregel Be Pita - כדורגל בפיתה',
//             link: 'https://www.facebook.com/kaduregelbepita/posts/281878285531475/',
//             content: '3 בספט׳ 2016 — הפועל בני אשדוד מישל אזוגי מועדון כדורגל צעירי לוד מועדון ספורט בני ... בלוד החליטו לקרוא לאצטדיון המקומי על שם בני רגב, האיש שבתור ראש העירייה ...',
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'עיתון זמן מבשרת גיליון 945 - avik - הפוך PDF מקוון',
//             link: 'https://fliphtml5.com/dvhf/cwfe/%D7%A2%D7%99%D7%AA%D7%95%D7%9F_%D7%96%D7%9E%D7%9F_%D7%9E%D7%91%D7%A9%D7%A8%D7%AA_%D7%92%D7%99%D7%9C%D7%99%D7%95%D7%9F_945/',    
//             content: '11 בדצמ׳ 2019 — ... הפועל בני אשדוד‪.‬ ‫גדר  רה‪ ,‬קבוצה מן החלק התחתון של הטבלה‬ ... השחיתות ולכן לא ק  קיבלוה‪ .‬אז מה העונש בזה ‫שצריך לצאת למקום רחוק‬ ...',   
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'עיתון זמן מבשרת גיליון 946 - avik - הפוך PDF מקוון',
//             link: 'https://fliphtml5.com/dvhf/natu/%D7%A2%D7%99%D7%AA%D7%95%D7%9F_%D7%96%D7%9E%D7%9F_%D7%9E%D7%91%D7%A9%D7%A8%D7%AA_%D7%92%D7%99%D7%9C%D7%99%D7%95%D7%9F_946/',    
//             content: '18 בדצמ׳ 2019 — ... שחיתות וסיאוב (סיאוב זה מצב שבו האדם המושחת ‫לרכוש כלים כל כך‬ ... הפועל בני אשד דוד והביסה אותה ‪5:0‬ ‫היה זה השחקן החדש אלרואי קישיק‬ ...   .',
//             keyword: 'שחיתות'
//           },
//           {
//             title: 'החצר האחורית של הכדורגל: לא ברור אם זה מגרש כדורגל או חוף ים',
//             link: 'https://ashdodi.com/%D7%94%D7%97%D7%A6%D7%A8-%D7%94%D7%90%D7%97%D7%95%D7%A8%D7%99%D7%AA-%D7%A9%D7%9C-%D7%94%D7%9B%D7%93%D7%95%D7%A8%D7%92%D7%9C-%D7%9C%D7%90-%D7%91%D7%A8%D7%95%D7%A8-%D7%90%D7%9D-%D7%96%D7%94-%D7%9E/',
//             content: '21 במאי 2023 — מרוב חול לא רואים את הדשא: בקבוצת הפועל בני אשדוד ניסו במהלך הימים האחרונים, לפני משחקם האחרון בליגה מול מיתר, להעביר את המפגש למקום אחר.',   
//             keyword: 'הונאה'
//           },
//           {
//             title: 'מעצר',
//             link: 'https://ashdodnet.com/mobile/Search?Text=%D7%9E%D7%A2%D7%A6%D7%A8&Page=7',
//             content: '... הונאה נגד קשישים וצרכנים נוספים. על פי החשד, הם ... הפועל בני אשדוד רדף אחרי שחקן הקבוצה היריבה. אחרי ... הפועל בני אשדוד התעמת עם שחקן קבוצה יריבה ...',
//             keyword: 'הונאה'
//           },
//           {
//             title: 'העיר שלהם: קבוצת הנערים של הפועל אשדוד דרסה את עירוני',
//             link: 'https://ashdodi.com/%D7%94%D7%A2%D7%99%D7%A8-%D7%A9%D7%9C%D7%94%D7%9D-%D7%A7%D7%91%D7%95%D7%A6%D7%AA-%D7%94%D7%A0%D7%A2%D7%A8%D7%99%D7%9D-%D7%A9%D7%9C-%D7%94%D7%A4%D7%95%D7%A2%D7%9C-%D7%90%D7%A9%D7%93%D7%95%D7%93-%D7%93/',
//             content: '17 בספט׳ 2022 — עירוני שהביסה את הנערים של הפועל בני אשדוד במחזור הפתיחה בתוצאה 7:1, קיוותה להשיג שלוש נקודות גם בדרבי מול היריבה העירונית האדומה השנייה, אך ...',
//             keyword: 'הונאה'
//           },
//           {
//             title: 'עיתון זמן מבשרת גיליון 1042 - avik - הפוך PDF מקוון',
//             link: 'https://fliphtml5.com/dvhf/nffr/%D7%A2%D7%99%D7%AA%D7%95%D7%9F_%D7%96%D7%9E%D7%9F_%D7%9E%D7%91%D7%A9%D7%A8%D7%AA_%D7%92%D7%99%D7%9C%D7%99%D7%95%D7%9F_1042/',   
//             content: '... הפועל בני אשדוד בבית‪.‬ ‫ירושלים‪/‬מבשר    רת ציון אצל הפועל ירושלים‪/‬פסגת זאב‬ ... 6ינפו ת\\"ז לפי    סדר ויחשפו שינוי לשם הונאה ‫‪ .3‬אחד משנים‪-‬עשר ועוד‬ ..     ..',
//             keyword: 'הונאה'
//           },
//           {
//             title: 'אשדוד',
//             link: 'https://he.unionpedia.org/i/%D7%90%D7%A9%D7%93%D7%95%D7%93',
//             content: 'תעודת כשרות לבית קפה חוק איסור הונאה בכשרות, התשמ"ג-1983, מייחד את ... הפועל בני אשדוד בצעדת ארבעת הימים הבינלאומית בניימכן, יולי 1967 לוגו הקבוצה ...',     
//             keyword: 'הונאה'
//           },
//           {
//             title: 'הפועל אשדוד',
//             link: 'https://he.wikipedia.org/wiki/%D7%94%D7%A4%D7%95%D7%A2%D7%9C_%D7%90%D7%A9%D7%93%D7%95%D7%93',
//             content: 'תאריך פירוק, 2001. אצטדיון, אצטדיון הי"א, אשדוד (תכולה: 7,800). בעלים, עמותה ... הפועל בני אשדוד בצעדת ארבעת הימים הבינלאומית בניימכן, יולי 1967 לוגו הקבוצה ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'המאבק על הסמל נמשך - חדשות אשדוד',
//             link: 'https://ashdod10.co.il/%D7%94%D7%9E%D7%90%D7%91%D7%A7-%D7%A2%D7%9C-%D7%94%D7%A1%D7%9E%D7%9C-%D7%A0%D7%9E%D7%A9%D7%9A/',
//             content: '19 בינו׳ 2023 — יוסי כנפו, אותו אחד שהקים את הפועל בני אשדוד, הציל את הפועל אדומים מפירוק, העמותה המנהלת את הפועל אדומים התחלפה. כנפו הקים בעונת 16/17 את בית"ר ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'פירוק',
//             link: 'https://ashdodnet.com/%D7%AA%D7%92%D7%99%D7%AA/%D7%A4%D7%99%D7%A8%D7%95%D7%A7',
//             content: '... פירוק הקבוצות שלהם וגברו 6-1 על אליצור יהודה. משחקה של הפועל בני אשדוד נגד כסייפה בוטל בהוראת ההתאחדות בשל המצב. בקטנה. האם ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'פחות מלהיב, יותר משמעותי: הדרבי האשדודי חוזר ובגדול',
//             link: 'https://doublepass.sport5.co.il/story.php?id=32415',
//             content: '31 באוג׳ 2023 — אך בעונתם השנייה, הקבוצה יצאה לפירוק והיא פתחה את העונה במינוס 12 נקודות. ... בקיץ האחרון, קומץ אוהדים אף פנה לבעלים של הפועל בני אשדוד, שמשחקת ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'מחדל: החובש עזב את המגרש וגרם לפיצוץ המשחק', 
//             link: 'https://www.one.co.il/Article/308483.html',   
//             content: '2 במרץ 2018 — כ הפועל בני אשדוד למ.כ בני לוד הופסק בדקה ה-77 במצב של 4:1 לזכות האשדודים, לאחר ששופטת המשחק, ספיר בוסקילה, הבחינה כי לא נמצא חובש בתחומי ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'דרבי',
//             link: 'https://ashdodnet.com/mobile/Search?Text=%D7%93%D7%A8%D7%91%D7%99&Page=1',
//             content: '... הפועל בני אשדוד במשחק שיש בו רגשות והמון אגו. הפועל האדומים בראש טבלת ליגה ג ... פירוק הקבוצות שלהם וגברו 6-1 על אליצור יהודה. משחקה של הפועל בני אשדוד ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: "שבע בום בדרבי: אדומים בדרך לליגה ב'",        
//             link: 'https://doublepass.sport5.co.il/story.php?id=17634',
//             content: '4 באפר׳ 2017 — בסוף השבוע הציגה הקבוצה הצגה נוספת כאשר הביסה במשחק הדרבי את הפועל בני אשדוד בתוצאה 1:7. כבר בדקות הפתיחה היה ניתן לראות שבני אשדוד משחקים ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'עמרי אפלבאום, עורך דין omria@gornitzky.com | 03-7109199 ...',
//             link: 'https://www.football.org.il/files/%D7%91%D7%94%D7%95%D7%9C%20-%20%D7%93%D7%A8%D7%99%D7%A9%D7%AA%20%D7%94%D7%A4%D7%95%D7%A2%D7%9C%20%D7%91%D7%A0%D7%99%20%D7%90%D7%A9%D7%93%D7%95%D7%93%20%D7%95%D7%9E%D7%A8%D7%9B%D7%96%20%D7%94%D7%A4%D7%95%D7%A2%D7%9C%20%D7%9C%D7%94%D7%95%D7%A8%D7%99%D7%93%20%D7%9E%D7%A1%D7%93%D7%A8%20%D7%94%D7%99%D7%95%D7%9D%20%D7%90%D7%AA%20%D7%A9%D7%9C%20%D7%94%D7%90%D7%A1%D7%99%D7%A4%D7%94%20%D7%94%D7%9B%D7%9C%D7%9C%D7%99%D7%AA%20%D7%90%D7%AA%20%D7%91%D7%A7%D7%A9%D7%AA%20%D7%90.%D7%A1.%20%D7%90%D7%A9%D7%93%D7%95%D7%93%20%D7%9C%D7%A9%D7%99%D7%A0%D7%95%D7%99%20%D7%A9%D7%9D.pdf',
//             content: '14 בספט׳ 2023 — יר אשדוד פועלת קבוצת כדורגל הנושאת את השם "הפועל בני אשדוד" העמותה לא ... נתן ביהמ"ש המחוזי בב"ש צו פירוק זמני לאדומים אשדוד ועוה"ד. ליזה ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'אשדוד 18.03.22',
//             link: 'https://user-oqw6j7d.cld.bz/shdvd-18-03-22/38/',
//             content: "18 במרץ 2022 — בזמן שהאחות החורגת הפועל אדומים אשדוד ניצבת על סף פירוק, צפויה הפועל בני אשדוד הצנועה לחגוג מחר העפלה היסטורית לליגה ב' ‰ שרלי אטיאס, ...",   
//             keyword: 'פירוק'
//           },
//           {
//             title: 'יומן פגרה - חדשות אשדוד',
//             link: 'https://ashdod10.co.il/58850-2/',
//             content: '8 ביולי 2022 — הפועל בני אשדוד הולכת על זהות. בשקט בשקט ועם הרבה דבקות במטרה, מצליחה הנהלת הפועל בני אשדוד להתכונן לעונה בצורה הכי טובה שיכולה להיות. האחות ...',
//             keyword: 'פירוק'
//           },
//           {
//             title: 'המועצה להסדר ההימורים בספורט',
//             link: 'https://content.winner.co.il/images/media/rrtdsczy/%D7%93%D7%95%D7%97_%D7%97%D7%95%D7%A4%D7%A9_%D7%94%D7%9E%D7%99%D7%93%D7%A2_2023.pdf',
//             content: '14 ביולי 2024 — ... הלבנת הון. בין השאר קבע החוק חובת מינוי. אחראי למניעת הלבנת הון ... הפועל בני אשדוד. הפועל. 2022. 7,509. 580593887. אליצור לוד. אליצור. 2022.',
//             keyword: 'הלבנת הון'
//           },
//           {
//             title: 'כדורגל',
//             link: 'https://ashdodnet.com/mobile/Search?Text=%D7%9B%D7%93%D7%95%D7%A8%D7%92%D7%9C&Page=4',
//             content: '... הלבנת הון, קבלת דבר במרמה בנסיבות מחמירות, זיוף בנסיבות מחמירות, קשירת ... הפועל בני אשדוד לאדומים אשדוד בוטלה בשלב זה. בבני אשדוד פנו להנהלת ההתאחדות ...',
//             keyword: 'הלבנת הון'
//           },
//           {
//             title: 'המועצה להסדר ההימורים בספורט | דין וחשבון שנתי על פי חוק חופש ...',
//             link: 'https://content.winner.co.il/images/media/t0ebtmma/%D7%93%D7%95%D7%97_%D7%97%D7%95%D7%A4%D7%A9_%D7%94%D7%9E%D7%99%D7%93%D7%A2_2022.pdf',
//             content: '7 במאי 2023 — הלבנת הון, אישרה הועדה למניעת הלבנת הון תהליך לסיווג. סיכון של בעלי ... הפועל בני אשדוד. 109,541. 580592475. עמותת ספורט בקהילה דיר. אל אסד.', 
//             keyword: 'הלבנת הון'
//           },
//           {
//             title: 'עיתון זמן מבשרת גיליון 1032 - avik - הפוך PDF מקוון',
//             link: 'https://fliphtml5.com/dvhf/tqnw/%D7%A2%D7%99%D7%AA%D7%95%D7%9F_%D7%96%D7%9E%D7%9F_%D7%9E%D7%91%D7%A9%D7%A8%D7%AA_%D7%92%D7%99%D7%9C%D7%99%D7%95%D7%9F_1032/',   
//             content: '... הפועל בני אשדוד‪ ,‬אך המארחת ‫רוצה להתא  אמן במסגרת מקצועית‪,‬‬ ‫שיתקיים ב‬ ... הלבנת שיניים ‫עבודו     ות מתכת‬ ‫עזרה ראשונה בשבתות וחגים‬ ‫מללחיאריתםחזרוולתי‬ .    ...',
//             keyword: 'הלבנת הון'
//           },
//           {
//             title: 'עיתון זמן מבשרת גיליון 945 - avik - הפוך PDF מקוון',
//             link: 'https://fliphtml5.com/dvhf/cwfe/%D7%A2%D7%99%D7%AA%D7%95%D7%9F_%D7%96%D7%9E%D7%9F_%D7%9E%D7%91%D7%A9%D7%A8%D7%AA_%D7%92%D7%99%D7%9C%D7%99%D7%95%D7%9F_945/',    
//             content: "11 בדצמ׳ 2019 — ... הפועל בני אשדוד‪.‬ ‫גדר  רה‪ ,‬קבוצה מן החלק התחתון של הטבלה‪,‬‬ ‫השמיני‪.‬‬ ‫מבשרת         ת אירחה את אליצור חשמונאים‪ .‬המשחה‬ ‫נערים ג' (מחוז דן‪ :    :)1‬‬ ...",
//             keyword: 'הלבנת הון'
//           },
//           {
//             title: 'יוצאים מעל גיל 50 אשדוד ישראל : סטודנט יוצא ב תל אביב ישראל (PI4B0O0)',
//             link: 'https://www.enceintes-hifi.fr/nusifeh',       
//             content: `ב- הוקמה מחדש קבוצת בית"ר אשדוד המשחקת ב ליגה ג' , כמו גם הקבוצות האחרות של העיר: אשדוד סיטי ו הפועל בני אשדוד. ... כספים". ... הלבנת הון, רח' כנפי נשרים 24 , ...`,
//             keyword: 'הלבנת הון'
//           },
//           {
//             title: 'עמרי אפלבאום, עורך דין omria@gornitzky.com | 03-7109199 ...',
//             link: 'https://www.football.org.il/files/%D7%91%D7%94%D7%95%D7%9C%20-%20%D7%93%D7%A8%D7%99%D7%A9%D7%AA%20%D7%94%D7%A4%D7%95%D7%A2%D7%9C%20%D7%91%D7%A0%D7%99%20%D7%90%D7%A9%D7%93%D7%95%D7%93%20%D7%95%D7%9E%D7%A8%D7%9B%D7%96%20%D7%94%D7%A4%D7%95%D7%A2%D7%9C%20%D7%9C%D7%94%D7%95%D7%A8%D7%99%D7%93%20%D7%9E%D7%A1%D7%93%D7%A8%20%D7%94%D7%99%D7%95%D7%9D%20%D7%90%D7%AA%20%D7%A9%D7%9C%20%D7%94%D7%90%D7%A1%D7%99%D7%A4%D7%94%20%D7%94%D7%9B%D7%9C%D7%9C%D7%99%D7%AA%20%D7%90%D7%AA%20%D7%91%D7%A7%D7%A9%D7%AA%20%D7%90.%D7%A1.%20%D7%90%D7%A9%D7%93%D7%95%D7%93%20%D7%9C%D7%A9%D7%99%D7%A0%D7%95%D7%99%20%D7%A9%D7%9D.pdf',
//             content: '14 בספט׳ 2023 — המבקשת על אף כל האמור לעיל, המבקשת הפרה וממשיכה להפר את הסכם הפשרה הפרות ... יר אשדוד פועלת קבוצת כדורגל הנושאת את השם "הפועל בני אשדוד" העמותה לא.',
//             keyword: 'הפרה'
//           },
//           {
//             title: 'תוצאות ספורט LIVE',
//             link: 'https://isport.co.il/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA-%D7%A1%D7%A4%D7%95%D7%A8%D7%98-live/',       
//             content: 'כ הפועל בני אשדוד. ישראל - ליגת העל לנשים - נשים. מחזור 8. הסתיים · הפועל פתח תקווה · 2 - 3 · מכבי כשרונות חדרה · הסתיים · הפועל בנות קטמון ירושלים · 4 - 2.',
//             keyword: 'הפרה'
//           },
//           {
//             title: 'דוד רביבו :" שמח על הזכות שניתנה לי לשחק בהפועל אדומים אשדוד"',
//             link: 'https://www.ashdod4u.com/27456-2/',
//             content: '20 באוק׳ 2017 — ... הפועל בני אשדוד. לאחר מספר שבועות, רביבו, שיחגוג בדצמבר הקרוב את יום הולדתו ה-40, וברזומה שלו מחזיק בתואר "מלך הבישולים של ליגת העל" עם 107 ...',
//             keyword: 'הפרה'
//           },
//           {
//             title: 'משכן',
//             link: 'https://ashdodnet.com/mobile/Search?Text=%D7%9E%D7%A9%D7%9B%D7%9F&Page=6',
//             content: `... הפרה הצוחקת" ו-"AVEVA". במשכן התענגו על 'קסם המגרב', באודיטוריום מונארט ... הפועל בני אשדוד גברה 5-1 על מ.ס ראשל"צ גם כן בגביע שניר דדון מבקיע רביעייה.`,
//             keyword: 'הפרה'
//           },
//           {
//             title: 'ישיבת מועצה 3-23 01.03.23 משנה 2-23 מקצועית 2-23 ונספחים',
//             link: 'https://www.ashdod.muni.il/media/16510293/%D7%99%D7%A9%D7%99%D7%91%D7%AA-%D7%9E%D7%95%D7%A2%D7%A6%D7%94-3-23-%D7%9E%D7%A9%D7%A0%D7%94-2-23-%D7%9E%D7%A7%D7%A6%D7%95%D7%A2%D7%99%D7%AA-2-23-%D7%95%D7%A0%D7%A1%D7%A4%D7%97%D7%99%D7%9D-01-03-23.pdf',
//             content: '3 באפר׳ 2023 — ככל וקיימת הפרה של מסמך המדיניות, מתקיי. מים הליכי אכיפה מנהליים ... הפועל בני אשדוד. 580592137. ₪. 233,500. ₪. 317,560. 18. ספורט. 79. מועדון ...',
//             keyword: 'הפרה'
//           },
//           {
//             title: 'ישיבת מועצה',
//             link: 'https://www.ashdod.muni.il/media/16497429/%D7%91%D7%AA%D7%95%D7%A1%D7%A4%D7%AA-%D7%9E%D7%A9%D7%A0%D7%94-%D7%95%D7%9E%D7%A7%D7%A6%D7%95%D7%A2%D7%99%D7%AA-%D7%9E%D7%95%D7%A0%D7%92%D7%A9-%D7%9E%D7%95%D7%A2%D7%A6%D7%94-%D7%A8%D7%92%D7%99%D7%9C%D7%94-7-3-18.pdf',
//             content: ')הפועל בני אשדוד (. מגרשי ספורט. 88,036. אליצור אשדוד. אולמות ספורט. 74,808. הפועל אשדוד כדורסל. אולמות ספורט. 231,905. ספורטאי מכבי אשדוד. אולמות ספורט.',  
//             keyword: 'הפרה'
//           },
//           {
//             title: 'ללא שם',
//             link: 'https://next.obudget.org/datapackages/sitemaps/entities.0060.html',
//             content: 'הפרה הסגולה בע״מ (חברה פרטית) · מרכז המזון נתניה בע״מ (חברה פרטית) · מסגרית ... הפועל בני אשדוד (ע"ר) (עמותה) · י. שבתאי ניסור יהלומים בע״מ (חברה פרטית) · דביר ...',
//             keyword: 'הפרה'
//           },
//           {
//             title: 'עיתון זמן מבשרת גיליון 945 - avik - הפוך PDF מקוון',
//             link: 'https://fliphtml5.com/dvhf/cwfe/%D7%A2%D7%99%D7%AA%D7%95%D7%9F_%D7%96%D7%9E%D7%9F_%D7%9E%D7%91%D7%A9%D7%A8%D7%AA_%D7%92%D7%99%D7%9C%D7%99%D7%95%D7%9F_945/',    
//             content: '11 בדצמ׳ 2019 — ... הפרה ‫שקר‪.‬‬ ‫בהליכי ג    גירושין‪ .‬הצדדים הגיעו להסדר גירושין לפיו הדירה‬ ... הפוע  על בני אשדוד‪.‬ ‫גדרה‪ ,‬קבוצה מן החלק התחתון של הטבלה‬ ..     ..',
//             keyword: 'הפרה'
//           },
//           {
//             title: 'Zmanmev1159',
//             link: 'https://www.calameo.com/books/0059763713a5803ab960f',
//             content: '4 באפר׳ 2024 — ... הפרה חמורה של ‫ומסייעים  להם להשיג את התוצאה הטובה ביותר‬ ... הפועל בני אשדוד בביתת‪.‬ ‫הפלייאוף התחתון‪ .‬איחוד צעירי אבו‬ ‫הקרוב‬ ...',   
//             keyword: 'הפרה'
//           }
//     ],
// }