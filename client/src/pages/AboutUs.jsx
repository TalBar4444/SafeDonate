import React from "react";
import "../styles/AboutUs.css";

/**
 * AboutUs page that displays information about the latform creators and contact information
 */
const AboutUs = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h2 className="about-heading">
          קצת עלינו
        </h2>
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            ברוכים הבאים ל-SafeDonate! אנו פלטפורמה ייחודית שמטרתה לספק מידע
            מקיף ואמין על עמותות בישראל, כדי לסייע לכם לקבל החלטות תרומה מושכלות
            ובטוחות. אנו משתמשים בטכנולוגיות מתקדמות ובמנועי חיפוש כדי לאתר מידע
            חשוב על עמותות, כולל המטרות שלהן, ההיסטוריה הפיננסית, והאם היו
            מעורבות בפעילויות פליליות או פירוק.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            האתר שלנו מבוסס על מחקר מעמיק והתחייבות למידע אמין, כך שתוכלו להרגיש
            בטוחים ורגועים בבחירת העמותות לתרום להן.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            אנו מאמינים בשקיפות ובנגישות לכל משתמש, ולכן יצרנו כלי חיפוש מתקדם
            אשר מספק תוצאות מותאמות אישית לפי הקריטריונים החשובים לכם.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>שימו לב:</strong> כל המידע המוצג באתר נאסף ממקורות ציבוריים
            זמינים ברשת. אנו משתדלים להציג מידע מדויק ועדכני, אך איננו נושאים
            באחריות לכל טעות או אי דיוק במידע המוצג. המידע מיועד לצורכי שקיפות
            בלבד ואין לראות בו כהמלצה חד משמעית לתרומה לעמותה מסוימת.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4 text-[#104d8e]">צרו קשר</h3>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="text-lg text-gray-700">
              במידה ויש לכם שאלות או הצעות, אתם מוזמנים לפנות אלינו בכתובת
              האימייל:
            </p>
            <a
              href="mailto:contactus@talandomer.com"
              className="block mt-2 text-xl font-semibold text-[#0072FF] hover:text-[#00C6FF] transition-colors duration-300"
            >
              contactus@talandomer.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
