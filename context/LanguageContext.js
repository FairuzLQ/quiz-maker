'use client';

import { createContext, useContext, useState } from 'react';
import en from '../translations/en.json';
import ar from '../translations/ar.json';

const translations = {
  en,
  ar,
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en'); // Default language

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setCurrentLang(newLang);
  };

  const t = translations[currentLang];

  return (
    <LanguageContext.Provider value={{ t, currentLang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
