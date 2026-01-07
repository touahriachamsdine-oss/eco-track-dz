'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
    const { t, language } = useLanguage();
    const [state, action, isPending] = useActionState(login, undefined);

    return (
        <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden ${language === 'ar' ? 'font-[Cairo]' : ''}`}>
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="absolute top-8 right-8 z-50">
                <LanguageSwitcher />
            </div>

            <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <span className="text-white font-black text-2xl">E</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-3 tracking-tight">{t('welcome_back')}</h1>
                    <p className="text-slate-400 font-medium">{t('welcome_to_eco')} DZ</p>
                </div>

                <form action={action} className="space-y-4">
                    <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{t('email_address')}</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-700 font-medium"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{t('password')}</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-700 font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-pulse">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] text-lg"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : t('sign_in')}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    {t('no_account')}{' '}
                    <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        {t('sign_up')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
