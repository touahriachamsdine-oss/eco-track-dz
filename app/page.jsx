"use client";
import Link from 'next/link';
import { Truck, Users, Activity, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from './components/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import { logout } from '@/app/actions/auth';
import { useEffect, useState } from 'react';

export default function Home() {
    const { t, language } = useLanguage();
    return (
        <main className={`min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center ${language === 'ar' ? 'font-[Cairo]' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* dynamic Background */}
            <div className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[5%] right-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            <nav className="w-full max-w-7xl px-6 py-8 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <span className="font-black text-white text-xl">E</span>
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-white">EcoTrack <span className="text-emerald-400">DZ</span></span>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSwitcher />
                    <AuthButton />
                </div>
            </nav>

            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative z-10 max-w-5xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    {t('tagline')}
                </div>

                <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">
                    {t('hero_title')}
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                    {t('hero_subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Link href="/signup" className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center gap-2 text-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        {t('join_movement')} <ArrowRight size={22} className={`group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                    <a href="#solutions" className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold rounded-2xl transition-all text-lg flex items-center gap-2">
                        {t('view_solutions')}
                    </a>
                </div>
            </section>

            <div id="solutions" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-6 py-20 relative z-10">
                <RoleCard
                    href="/admin"
                    icon={<Activity size={32} />}
                    title={t('control_center')}
                    description={t('control_center_desc')}
                    color="blue"
                    t={t}
                    language={language}
                />
                <RoleCard
                    href="/collector"
                    icon={<Truck size={32} />}
                    title={t('field_operations')}
                    description={t('field_operations_desc')}
                    color="emerald"
                    highlight
                    t={t}
                    language={language}
                />
                <RoleCard
                    href="/citizen"
                    icon={<Users size={32} />}
                    title={t('citizen_access')}
                    description={t('citizen_access_desc')}
                    color="amber"
                    t={t}
                    language={language}
                />
            </div>

            <footer className="w-full max-w-7xl border-t border-slate-800/50 py-12 px-6 mt-10 text-center flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
                <p>{t('footer_copyright')}</p>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
                </div>
            </footer>
        </main>
    );
}

function RoleCard({ href, icon, title, description, color, highlight, t, language }) {
    const colorMap = {
        emerald: 'from-emerald-500/20 to-emerald-950/20 text-emerald-400 border-emerald-500/20',
        blue: 'from-blue-500/20 to-blue-950/20 text-blue-400 border-blue-500/20',
        amber: 'from-amber-500/20 to-amber-950/20 text-amber-400 border-amber-500/20',
    };

    return (
        <Link
            href={href}
            className={`group relative p-8 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col h-full bg-slate-900/40 backdrop-blur-xl ${highlight ? 'border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'border-slate-800/50'}`}
        >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorMap[color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center mb-8 border ${colorMap[color].split(' ').pop()} shadow-lg`}>
                <div className={colorMap[color].split(' ').slice(2, 3).join(' ')}>{icon}</div>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-lg mb-8 flex-1">{description}</p>

            <div className="inline-flex items-center text-sm font-bold text-slate-500 group-hover:text-white transition-all uppercase tracking-widest gap-2">
                {t('open_portal')} <ArrowRight size={16} className={`group-hover:translate-x-2 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
            </div>

            {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-[10px] font-black uppercase tracking-tighter text-white rounded-full shadow-lg">
                    {t('recommended')}
                </div>
            )}
        </Link>
    );
}



function AuthButton() {
    const { t } = useLanguage();
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Fetch session on client
        const fetchSession = async () => {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
                const data = await res.json();
                setSession(data);
            }
        };
        fetchSession();
    }, []);

    if (session) {
        return (
            <div className="flex gap-4">
                <form action={logout}>
                    <button className="px-6 py-2.5 rounded-full bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-sm font-medium border border-slate-700 transition-all">
                        {t('logout')}
                    </button>
                </form>
                <Link href={session.role === 'admin' ? '/admin' : session.role === 'collector' ? '/collector' : '/citizen'} className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                    {t('go_to_dashboard')}
                </Link>
            </div>
        );
    }

    return (
        <Link href="/login" className="px-6 py-2.5 rounded-full bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-sm font-medium border border-slate-700 transition-all shadow-lg hover:shadow-emerald-500/10">
            {t('log_in')}
        </Link>
    );
}
