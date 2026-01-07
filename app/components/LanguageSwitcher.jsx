
"use client";

import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { language, changeLanguage } = useLanguage();

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ar', label: 'العربية', flag: '🇩🇿' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ber', label: 'Tamazight', flag: '♓' }
    ];

    return (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 shadow-inner">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === lang.code
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <span className="text-sm">{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.label}</span>
                </button>
            ))}
        </div>
    );
}
