
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang');
        if (savedLang && (savedLang === 'en' || savedLang === 'ar' || savedLang === 'fr' || savedLang === 'ber')) {
            setLanguage(savedLang);
        }
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('app_lang', lang);
        // Force direction for Arabic
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = lang;
        }
    };

    const t = (key, variables = {}) => {
        let text = translations[language][key] || translations['en'][key] || key;

        // Handle variables like {value}
        Object.keys(variables).forEach(v => {
            text = text.replace(`{${v}}`, variables[v]);
        });

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
