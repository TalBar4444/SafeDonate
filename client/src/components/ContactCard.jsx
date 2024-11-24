import React from 'react';

/**
 * Modal component that displays contact information for an association
 */
const ContactCard = ({
  mainTitle = 'יצירת קשר',
  subtitle = 'מידע רשמי',
  contactInfo,
  isLoading,
  onClose,
  noContactMessage = 'העמותה לא סיפקה אמצעים ליצירת קשר'
}) => {

  // Check if we have any contact details
  const hasContactDetails = contactInfo?.website || contactInfo?.email || contactInfo?.phoneNumbers?.length || contactInfo?.address;
  // Function to ensure website has proper format
  const formatLink = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
  <>
  <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
    <div 
      className="relative bg-white rounded-xl shadow-md p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto font-sans" 
      dir="rtl"
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="סגור"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <div className="mb-6">
        <h1 className="text-[#2B4F71] text-2xl font-bold mb-1">{mainTitle}</h1>
        <h2 className="text-gray-600 text-lg">{subtitle}</h2>
      </div>
      
      {/* website section appears first if it exists */}
      
      {isLoading ? (
        <p className="text-gray-500">טוען פרטי קשר...</p>
      ) : hasContactDetails ? (
        <>
          {contactInfo?.website && (
            <div className="flex items-center mb-4 gap-3">
              <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white">🔗</div>
              <a 
                href={formatLink(contactInfo.website)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#45B5AA] hover:text-[#3a9990] transition-colors font-medium"
              >
                לאתר הרשמי
              </a>
            </div>
          )}

          {contactInfo?.email && (
            <div className="flex items-center mb-4 gap-3">
              <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white">
                ✉️
              </div>
              <span className="text-gray-700">
                <strong>אמייל:</strong> <a href={`mailto:${contactInfo.email}`} className="hover:text-[#45B5AA] transition-colors">
                  {contactInfo.email}
                </a>
              </span>
            </div>
          )}   

          {contactInfo?.phoneNumbers && Array.isArray(contactInfo.phoneNumbers) && contactInfo.phoneNumbers.length > 0 && (
            <div className="flex items-center mb-4 gap-3">
              <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white">
                📞
              </div>
              <span className="text-gray-700">
                <strong>טלפון:</strong> {contactInfo.phoneNumbers.join(' | ')}
              </span>           
            </div>
          )}

          {contactInfo?.address && (
            <div className="flex items-center mb-4 gap-3">
              <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white p-2">
                🏠
              </div>
              <span className="text-gray-700">
                <strong>כתובת רשמית:</strong> {contactInfo.address || (
                  <span className="text-gray-500">כתובת מלאה לא זמינה</span>
                )}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              ℹ️
            </div>
            <span className="text-gray-600 font-medium">שים לב</span>
          </div>
          <p className="text-gray-500 text-sm pr-11">
            {noContactMessage}
          </p>
        </div>
      )}
    </div>
  </div>
  </>
  );
};

export default ContactCard;