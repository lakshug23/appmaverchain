import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { ta } from '../translations/ta';
import { hi } from '../translations/hi';
import { fr } from '../translations/fr';
import { la } from '../translations/la';

const translations = {
  en,
  ta,
  hi,
  fr,
  la
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
    setT(translations[savedLanguage] || translations.en);
  }, []);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      setT(translations[language]);
      localStorage.setItem('language', language);
    }
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
      { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'la', name: 'Latina', flag: '🏛️' }
    ];
  };

  const value = {
    t,
    currentLanguage,
    changeLanguage,
    getAvailableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 