import React, { createContext, useState, useContext, useEffect } from 'react';
import dictionary from '../locales/dictionary';

// Membuat Context Bahasa
const LanguageContext = createContext();

// Provider Bahasa untuk membungkus aplikasi
export const LanguageProvider = ({ children }) => {
  // Mengambil bahasa default dari localStorage atau default ke Bahasa Indonesia ('id')
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('techgo_lang');
    return savedLanguage === 'en' || savedLanguage === 'id' ? savedLanguage : 'id';
  });

  // Efek samping untuk menyimpan pilihan bahasa ke localStorage
  useEffect(() => {
    localStorage.setItem('techgo_lang', language);
  }, [language]);

  // Fungsi untuk mengubah bahasa secara aktif
  const changeLanguage = (lang) => {
    if (lang === 'id' || lang === 'en') {
      setLanguage(lang);
    }
  };

  // Fungsi helper penerjemah teks (translate) berdasarkan key
  // Mengambil dictionary berdasarkan bahasa yang aktif
  const t = (path) => {
    const keys = path.split('.');
    let current = dictionary[language];

    for (const key of keys) {
      if (current[key] !== undefined) {
        current = current[key];
      } else {
        // Jika tidak ditemukan, kembalikan path aslinya sebagai fallback
        console.warn(`Translation path "${path}" not found in language "${language}"`);
        return path;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom Hook untuk mempermudah penggunaan LanguageContext di komponen lain
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage harus digunakan di dalam LanguageProvider');
  }
  return context;
};
