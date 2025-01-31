import React, { useState } from 'react';

export function LanguageSelector({ selectedLanguage, onLanguageChange }) {
  const [showMessage, setShowMessage] = useState(false);

  const handleLanguageClick = (language) => {
    if (language === 'html') {
      onLanguageChange(language);
    } else {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
  };

  return (
    <div className="language-selector">
      <button 
        onClick={() => handleLanguageClick('html')}
        className={selectedLanguage === 'html' ? 'active' : ''}
      >
        HTML
      </button>
      <button 
        onClick={() => handleLanguageClick('css')}
        className="disabled"
      >
        CSS
      </button>
      <button 
        onClick={() => handleLanguageClick('javascript')}
        className="disabled"
      >
        JavaScript
      </button>
      
      {showMessage && (
        <div className="feature-message">
          Feature not available
        </div>
      )}
    </div>
  );
} 