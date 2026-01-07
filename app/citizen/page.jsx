
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronRight, Leaf, Trash2, Home, LogOut,
    Camera, MapPin, Calendar, Search, HelpCircle,
    Bell, Settings, User, BarChart3, Clock, CheckCircle, Activity, Menu, X, Zap, TrendingUp
} from 'lucide-react';
import { getCurrentUser, logout } from '@/app/actions/auth';
import { getCitizenStats, submitReport, searchWasteGuide, getWasteGuide, getUserPickups, getRewards, redeemReward, getRedemptions } from '@/app/actions/dashboard';
import { useLanguage } from '../components/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import WasteScanner from '../components/WasteScanner';
import EcoAssistant from '../components/EcoAssistant';
import NotificationCenter from '../components/NotificationCenter';

export default function CitizenApp() {
    const { t, language } = useLanguage();
    const [showReportModal, setShowReportModal] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ points: 0, reports: [] });
    const [schedule, setSchedule] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [fullGuide, setFullGuide] = useState([]);
    const [reportFilter, setReportFilter] = useState('active');
    const [activeGuideCategory, setActiveGuideCategory] = useState('All');
    const [rewards, setRewards] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [isRedeeming, setIsRedeeming] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getCurrentUser();
            setUser(userData);
            const userStats = await getCitizenStats();
            if (userStats) setStats(userStats);
            const guideData = await getWasteGuide();
            setFullGuide(guideData);
            const pickupData = await getUserPickups();
            setSchedule(pickupData);
            const rewardData = await getRewards();
            setRewards(rewardData);
            const redemptionData = await getRedemptions();
            setRedemptions(redemptionData);
        };
        fetchData();

        // Responsive sidebar
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleRedeem = async (rewardId) => {
        setIsRedeeming(rewardId);
        const res = await redeemReward(rewardId);
        if (res.success) {
            // Refresh points and history
            const userStats = await getCitizenStats();
            setStats(userStats);
            const history = await getRedemptions();
            setRedemptions(history);
        } else {
            alert(res.error || 'Failed to redeem reward');
        }
        setIsRedeeming(null);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length > 2) {
            const results = await searchWasteGuide(query);
            setSearchResult(results);
        } else {
            setSearchResult([]);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (uploadedImage) {
            formData.append('imageUrl', uploadedImage);
        }

        const res = await submitReport(formData);
        if (res.success) {
            setShowReportModal(false);
            setUploadedImage(null);
            const userStats = await getCitizenStats();
            if (userStats) setStats(userStats);
            alert('Report Submitted Successfully! You earned 50 points.');
        } else {
            alert(res.error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        // In a real app, we would upload to S3/Cloudinary
        // For this demo, we use a FileReader to create a local base64 preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={`min-h-screen bg-[#020617] text-slate-200 font-['Outfit'] flex overflow-hidden ${language === 'ar' ? 'font-[Cairo]' : ''}`}>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 bg-slate-900/50 backdrop-blur-3xl border-white/5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Leaf className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">{t('eco_track')} <span className="text-emerald-500">DZ</span></span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarNavItem icon={<Home size={20} />} label={t('overview')} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <SidebarNavItem icon={<Calendar size={20} />} label={t('pickup_schedule')} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
                        <SidebarNavItem icon={<Leaf size={20} />} label={t('waste_guide')} active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} />
                        <SidebarNavItem icon={<Activity size={20} />} label={t('my_reports')} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                        <SidebarNavItem icon={<Zap size={20} />} label="Marketplace" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
                        <SidebarNavItem icon={<HelpCircle size={20} />} label={t('support')} active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-6 px-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                {user?.name?.charAt(0) || 'C'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.name || t('loading')}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={() => logout()} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all group">
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Topbar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-slate-400 hover:text-white ${isSidebarOpen ? 'hidden' : 'block'}`}>
                            <Menu size={24} />
                        </button>
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={t('search')}
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                            />
                            {searchResult.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 backdrop-blur-xl">
                                    {searchResult.map((item) => (
                                        <div key={item.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-white">{item.name}</h4>
                                                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{item.category}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">{item.instructions}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <LanguageSwitcher />
                        <NotificationCenter />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative">
                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full -ml-64 -mb-64 blur-[120px] pointer-events-none"></div>

                    {activeTab === 'overview' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 relative z-10">
                            {/* Hero Section */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                <div className="xl:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-[3.5rem] p-12 text-white shadow-[0_40px_100px_rgba(16,185,129,0.2)] border border-white/10 group">
                                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -mr-48 -mt-48 blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="max-w-xl">
                                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-8">
                                                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-50">{t('impact_leader')}</span>
                                            </div>
                                            <h1 className="text-6xl font-black tracking-tighter mb-4 leading-tight">
                                                {t('hello')}, {user?.name?.split(' ')[0] || 'Citizen'}
                                            </h1>
                                            <p className="text-emerald-50/70 text-lg font-medium leading-relaxed">
                                                {t('impact_summary', { value: '42kg' })}
                                            </p>
                                        </div>
                                        <div className="mt-16 flex items-center gap-16">
                                            <ImpactMetric label={t('eco_points')} value={stats.points?.toLocaleString()} sub={t('lifetime')} />
                                            <div className="w-px h-16 bg-white/10"></div>
                                            <ImpactMetric label={t('carbon_saved')} value="24.5kg" sub={t('this_month')} />
                                            <div className="w-px h-16 bg-white/10"></div>
                                            <ImpactMetric label={t('community_rank')} value="#142" sub={t('algiers_region')} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-[60px]"></div>
                                    <div className="space-y-8 relative z-10">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <Activity size={24} />
                                            </div>
                                            {t('quick_actions')}
                                        </h3>
                                        <div className="space-y-4">
                                            <QuickActionBtn
                                                icon={<Zap size={22} />}
                                                label={t('ai_smart_scan')}
                                                sub={t('auto_classify')}
                                                color="emerald"
                                                onClick={() => setShowScanner(true)}
                                            />
                                            <QuickActionBtn
                                                icon={<Camera size={22} />}
                                                label={t('report_issue')}
                                                sub="+50 Points"
                                                color="blue"
                                                onClick={() => setShowReportModal(true)}
                                            />
                                            <QuickActionBtn
                                                icon={<Calendar size={22} />}
                                                label={t('pickup_details')}
                                                sub={t('view_calendar')}
                                                color="amber"
                                                onClick={() => setActiveTab('schedule')}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-white/5">
                                        <div className="flex justify-between items-end mb-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('monthly_goal')}</p>
                                            <p className="text-xs font-black text-emerald-500">76%</p>
                                        </div>
                                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[76%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Scanner Integration */}
                            {showScanner && <WasteScanner onClose={() => setShowScanner(false)} />}

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                {/* Recent Activity */}
                                <div className="xl:col-span-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t('recent_activity')}</h3>
                                        <button onClick={() => setActiveTab('reports')} className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-all">Full History &rarr;</button>
                                    </div>
                                    <div className="space-y-4">
                                        {stats.reports.slice(0, 3).map((report) => (
                                            <ActivityCard key={report.id} report={report} />
                                        ))}
                                        {stats.reports.length === 0 && (
                                            <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center opacity-50">
                                                <Activity size={48} className="text-slate-700 mb-4" />
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('no_recent_activity')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar Widgets */}
                                <div className="xl:col-span-4 space-y-10">
                                    <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest">{t('next_pickup')}</h3>
                                            <Clock className="text-blue-500" size={24} />
                                        </div>
                                        <div className="space-y-6">
                                            {schedule.slice(0, 2).map((item) => {
                                                const dateObj = new Date(item.createdAt);
                                                const day = dateObj.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language, { weekday: 'long' });
                                                const month = dateObj.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language, { month: 'short' });
                                                const dayNum = dateObj.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language, { day: 'numeric' });

                                                let statusLabel = item.status.toUpperCase();
                                                if (statusLabel === 'PAST') statusLabel = t('past').toUpperCase();
                                                if (statusLabel === 'TODAY') statusLabel = t('today').toUpperCase();

                                                return (
                                                    <PickupSummaryItem
                                                        key={item.id}
                                                        day={day}
                                                        month={month}
                                                        dayNum={dayNum}
                                                        types={[item.type]}
                                                        status={statusLabel}
                                                        t={t}
                                                    />
                                                );
                                            })}
                                            {schedule.length === 0 && <div className="text-center py-10 opacity-30 uppercase tracking-widest text-[10px] font-black">{t('no_missions_synced')}</div>}
                                        </div>
                                        <button onClick={() => setActiveTab('schedule')} className="w-full py-5 bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold text-xs rounded-2xl transition-all border border-white/5 uppercase tracking-[0.2em]">
                                            {t('full_calendar')}
                                        </button>
                                    </div>

                                    {/* District Leaderboard Widget */}
                                    <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest">{t('zone_rank')}</h3>
                                            <TrendingUp className="text-emerald-500" size={24} />
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <LeaderboardItem name="Sidi M'Hamed" score="12,450" rank={1} trend="up" />
                                            <LeaderboardItem name="Bab El Oued" score="10,200" rank={2} trend="stable" />
                                            <LeaderboardItem name="Zeralda" score="8,900" rank={3} trend="up" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{t('pickup_schedule')}</h2>
                                    <p className="text-slate-500 font-medium">{t('global_network')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {schedule.map((item, idx) => {
                                    const dateObj = new Date(item.createdAt);
                                    const day = dateObj.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language, { weekday: 'long' });
                                    const dateStr = dateObj.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language, { month: 'short', day: 'numeric' });

                                    let statusLabel = item.status.toUpperCase();
                                    if (statusLabel === 'PAST') statusLabel = t('past').toUpperCase();
                                    if (statusLabel === 'TODAY') statusLabel = t('today').toUpperCase();

                                    return (
                                        <DesktopScheduleCard
                                            key={item.id}
                                            day={day}
                                            date={dateStr}
                                            type={item.type}
                                            time={item.time || '08:00 - 10:00'}
                                            status={statusLabel}
                                            primary={idx === 0}
                                            t={t}
                                        />
                                    );
                                })}
                                {schedule.length === 0 && (
                                    <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center opacity-30">
                                        <Calendar size={64} className="mx-auto mb-6" />
                                        <p className="text-xl font-black uppercase tracking-widest">{t('no_active_missions')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'guide' && (
                        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                            <div className="text-center max-w-2xl mx-auto space-y-4">
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{t('disposal_intelligence')}</h2>
                                <p className="text-slate-500 text-lg font-medium">{t('disposal_intel_desc')}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                <GuideCategoryCard icon="📦" label="All" count={`${fullGuide.length} Items`} active={activeGuideCategory === 'All'} onClick={() => setActiveGuideCategory('All')} />
                                <GuideCategoryCard icon="🍌" label="Organic" count="45 Items" active={activeGuideCategory === 'Organic'} onClick={() => setActiveGuideCategory('Organic')} />
                                <GuideCategoryCard icon="🍾" label="Glass" count="12 Items" active={activeGuideCategory === 'Glass'} onClick={() => setActiveGuideCategory('Glass')} />
                                <GuideCategoryCard icon="🔋" label="Hazardous" count="15 Items" active={activeGuideCategory === 'Hazardous'} onClick={() => setActiveGuideCategory('Hazardous')} />
                                <GuideCategoryCard icon="🔌" label="E-Waste" count="22 Items" active={activeGuideCategory === 'E-Waste'} onClick={() => setActiveGuideCategory('E-Waste')} />
                                <GuideCategoryCard icon="🛋️" label="Bulk" count="8 Items" active={activeGuideCategory === 'Bulk'} onClick={() => setActiveGuideCategory('Bulk')} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {fullGuide
                                    .filter(item => activeGuideCategory === 'All' || item.category === activeGuideCategory)
                                    .slice(0, 10).map((item) => (
                                        <div key={item.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 flex items-start gap-6 group hover:border-emerald-500/30 transition-all shadow-xl">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                {item.name.toLowerCase().includes('paper') ? '📄' :
                                                    item.name.toLowerCase().includes('glass') ? '🍷' :
                                                        item.category.toLowerCase() === 'organic' ? '🍌' : '🗑️'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{item.name}</h4>
                                                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">{item.category}</span>
                                                </div>
                                                <p className="text-slate-500 font-medium leading-relaxed">{item.instructions}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-left-6 duration-700 text-white">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter">{t('my_reports')}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{t('status_tracking')}</p>
                                </div>
                                <div className="flex bg-slate-900 border border-white/5 p-1 rounded-2xl">
                                    <button
                                        onClick={() => setReportFilter('active')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                    >{t('active')}</button>
                                    <button
                                        onClick={() => setReportFilter('resolved')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportFilter === 'resolved' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                    >{t('resolved')}</button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {stats.reports
                                    .filter(r => reportFilter === 'active' ? r.status !== 'resolved' : r.status === 'resolved')
                                    .map((report) => (
                                        <div key={report.id} className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
                                            <div className={`absolute top-0 left-0 w-2 h-full ${report.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <div className="w-40 h-40 bg-slate-800 rounded-[2rem] flex items-center justify-center border border-white/5 relative overflow-hidden flex-shrink-0">
                                                <Camera size={48} className="text-slate-600 relative z-10" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent"></div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-3xl font-black uppercase tracking-tight">{report.type.replace('-', ' ')}</h3>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                        {t('case')}: {report.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('deployment_location')}</p>
                                                        <p className="font-bold flex items-center gap-2"><MapPin size={16} className="text-emerald-500" /> {report.location}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('incident_timestamp')}</p>
                                                        <p className="font-bold flex items-center gap-2"><Clock size={16} className="text-blue-500" /> {new Date(report.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : language)}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('verified_id')}</p>
                                                        <p className="font-bold">#TR-{report.id.slice(-6).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 font-medium leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">{report.description}</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">{t('track_ops')}</button>
                                                <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all">{t('boost_case')}</button>
                                            </div>
                                        </div>
                                    ))}
                                {stats.reports.filter(r => reportFilter === 'active' ? r.status !== 'resolved' : r.status === 'resolved').length === 0 && (
                                    <div className="p-40 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center">
                                        <Trash2 size={80} className="text-slate-800 mb-8" />
                                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{t('no_reports_yet', { status: reportFilter === 'active' ? 'Active' : 'Resolved' })}</h3>
                                        <p className="text-slate-500 max-w-sm text-lg font-medium leading-relaxed">{t('clean_env_msg')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'marketplace' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter">{t('eco_marketplace')}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{t('marketplace_desc')}</p>
                                </div>
                                <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center gap-4">
                                    <span className="text-2xl font-black text-emerald-400">{stats.points?.toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">{t('your_credits')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {rewards.map((reward) => (
                                    <MarketplaceCard
                                        key={reward.id}
                                        image={reward.category === 'Groceries' ? '🛍️' : reward.category === 'Transit' ? '🚌' : reward.category === 'Eco' ? '🌳' : '☕'}
                                        title={reward.title}
                                        cost={reward.pointsCost}
                                        description={reward.description}
                                        onRedeem={() => handleRedeem(reward.id)}
                                        isLoading={isRedeeming === reward.id}
                                        t={t}
                                    />
                                ))}
                            </div>

                            {redemptions.length > 0 && (
                                <div className="space-y-8 pt-12 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">My Coupons</h3>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your reward redemption history</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {redemptions.map((redemption) => (
                                            <div key={redemption.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all">
                                                        {redemption.reward.category === 'Groceries' ? '🛍️' : redemption.reward.category === 'Transit' ? '🚌' : redemption.reward.category === 'Eco' ? '🌳' : '☕'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white uppercase tracking-tight">{redemption.reward.title}</h4>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Redeemed on {new Date(redemption.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono">
                                                    {redemption.code.slice(-8).toUpperCase()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-top-6 duration-700">
                            <div>
                                <h2 className="text-5xl font-black uppercase tracking-tighter">{t('support')}</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{t('citizen_assistance')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <SupportCard icon={<HelpCircle size={32} />} label={t('knowledge_base')} sub={t('browse_docs')} />
                                <SupportCard icon={<Bell size={32} />} label={t('live_chat')} sub={t('connect_hq')} />
                                <SupportCard icon={<Settings size={32} />} label={t('report_tech_issue')} sub={t('platform_assistance')} />
                            </div>

                            <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-8">{t('faq')}</h3>
                                <div className="divide-y divide-white/5">
                                    <FaqItem q={t('faq_q1')} a={t('faq_a1')} />
                                    <FaqItem q={t('faq_q2')} a={t('faq_a2')} />
                                    <FaqItem q={t('faq_q3')} a={t('faq_a3')} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Issue Modal - Redesigned */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative">
                            <button onClick={() => setShowReportModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                                <X size={32} />
                            </button>

                            <form onSubmit={handleReportSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white tracking-tight uppercase tracking-wider">{t('submit_report')}</h3>
                                    <p className="text-slate-500 font-medium">{t('help_algeria_msg')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div
                                            onClick={() => document.getElementById('report-image-upload').click()}
                                            className="relative group p-10 bg-slate-800 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden min-h-[250px]"
                                        >
                                            {uploadedImage ? (
                                                <>
                                                    <img src={uploadedImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative z-10 p-4 bg-black/60 backdrop-blur-md rounded-2xl flex items-center gap-2">
                                                        <CheckCircle className="text-emerald-500" size={20} />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('image_loaded')}</span>
                                                    </div>
                                                </>
                                            ) : isUploading ? (
                                                <div className="animate-pulse flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                                                        <Clock className="animate-spin" size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-300">{t('processing')}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                                        <Camera size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-300">{t('click_upload')}</p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{t('upload_limit')}</p>
                                                </>
                                            )}
                                            <input
                                                id="report-image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">{t('issue_type')}</label>
                                            <select name="type" required className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 ring-emerald-500/20 focus:border-emerald-500/50 transition-all">
                                                <option value="overflowing-bin">{t('overflowing_bin')}</option>
                                                <option value="illegal-dumping">{t('illegal_dumping')}</option>
                                                <option value="damaged-bin">{t('damaged_bin')}</option>
                                                <option value="missed-pickup">{t('missed_pickup')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">{t('location')}</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                                                <input
                                                    name="location"
                                                    type="text"
                                                    required
                                                    placeholder={t('detecting_gps')}
                                                    defaultValue="Algiers, Algeria"
                                                    className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">{t('additional_context')}</label>
                                    <textarea
                                        name="description"
                                        placeholder={t('description_placeholder')}
                                        className="w-full bg-slate-800 border border-white/5 rounded-[2rem] p-6 text-white min-h-[120px] focus:outline-none focus:ring-2 ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-600"
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full py-5 bg-emerald-600 rounded-[1.5rem] font-black text-white hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/30 active:scale-[0.98] uppercase tracking-[0.2em] text-lg">
                                    {t('finalize_report')}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function SupportCard({ icon, label, sub }) {
    return (
        <button className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] text-center space-y-4 hover:border-emerald-500/30 transition-all group">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="font-black text-white uppercase tracking-tight">{label}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sub}</p>
            </div>
        </button>
    );
}

function FaqItem({ q, a }) {
    return (
        <div className="py-6 first:pt-0 last:pb-0">
            <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{q}</h4>
            <p className="text-slate-500 font-medium leading-relaxed">{a}</p>
        </div>
    );
}

function SidebarNavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${active
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <span className={`${active ? 'text-white' : 'group-hover:text-emerald-500'} transition-colors`}>{icon}</span>
            <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}

function DesktopScheduleItem({ day, date, types, status }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex flex-col items-center justify-center flex-shrink-0 border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase">{date.split(' ')[0]}</span>
                    <span className="text-lg font-black text-white leading-none">{date.split(' ')[1]}</span>
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">{day}</h4>
                    <div className="flex gap-1 mt-1">
                        {types.map(t => (
                            <div key={t} className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        ))}
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">{status}</span>
                    </div>
                </div>
            </div>
            <div className="flex -space-x-2">
                {types.map(t => (
                    <div key={t} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs">
                        {t === 'organic' ? '🍏' : t === 'plastic' ? '🥤' : '🗑️'}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ImpactMetric({ label, value, sub }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">{label}</p>
            <div className="flex items-end gap-2">
                <h2 className="text-4xl font-black tracking-tighter leading-none">{value}</h2>
                <span className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest mb-1">{sub}</span>
            </div>
        </div>
    );
}

function QuickActionBtn({ icon, label, sub, color, onClick }) {
    const colors = {
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
    };
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all group ${colors[color]}`}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    {icon}
                </div>
                <div className="text-left">
                    <p className="font-black text-white text-sm uppercase tracking-tight">{label}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{sub}</p>
                </div>
            </div>
            <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
        </button>
    );
}

function ActivityCard({ report }) {
    const isResolved = report.status === 'resolved';
    return (
        <div className="group bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-white/10 p-6 rounded-[2.5rem] flex items-center gap-8 transition-all">
            <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center flex-shrink-0 border-2 ${isResolved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                {isResolved ? <CheckCircle size={32} /> : <Clock size={32} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-xl text-white uppercase tracking-tight truncate">{report.type.replace('-', ' ')}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isResolved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{report.status}</span>
                </div>
                <div className="flex items-center gap-6">
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2"><MapPin size={14} className="opacity-50" /> {report.location}</p>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2"><Calendar size={14} className="opacity-50" /> {new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

function PickupSummaryItem({ day, month, dayNum, types, status, t }) {
    return (
        <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase">{month}</span>
                    <span className="text-xl font-black text-white leading-none mt-1">{dayNum}</span>
                </div>
                <div>
                    <h4 className="font-black text-white uppercase tracking-tight">{day}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{types.join(' · ')}</p>
                </div>
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{status}</span>
        </div>
    );
}

function DesktopScheduleCard({ day, date, type, time, status, primary, t }) {
    const isPast = status === 'PAST' || status === t('past').toUpperCase();
    const isToday = status === 'TODAY' || status === t('today').toUpperCase();
    return (
        <div className={`relative p-10 rounded-[3rem] border transition-all group ${primary
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-500/30 shadow-[0_30px_60px_rgba(16,185,129,0.3)]'
            : isPast
                ? 'bg-slate-900/50 border-white/5 opacity-40 grayscale'
                : 'bg-slate-900 border-white/5 hover:border-white/20'
            }`}>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h4 className={`text-4xl font-black tracking-tighter text-white`}>{day}</h4>
                    <p className={`text-sm font-black uppercase tracking-[0.2em] ${primary ? 'text-emerald-100/60' : 'text-slate-500'}`}>{date}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${primary ? 'bg-white/10 backdrop-blur-md' : 'bg-white/5'}`}>
                    <Calendar size={28} className={primary ? 'text-white' : 'text-slate-400'} />
                </div>
            </div>
            <div className="space-y-6">
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${primary ? 'text-emerald-200' : 'text-slate-500'}`}>{t('waste_category')}</p>
                    <p className="text-xl font-black uppercase tracking-tight">{type}</p>
                </div>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${primary ? 'text-emerald-200' : 'text-slate-500'}`}>{t('window_time')}</p>
                    <p className="text-xl font-black uppercase tracking-tight">{time}</p>
                </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${primary ? 'text-emerald-100' : 'text-slate-400'}`}>{status}</span>
                {isToday && <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>}
            </div>
        </div>
    );
}

function MarketplaceCard({ image, title, cost, description, onRedeem, isLoading, t }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] hover:border-emerald-500/30 transition-all group shadow-2xl flex flex-col justify-between">
            <div>
                <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">{image}</div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none">{title}</h4>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{cost} {t('points')}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('available')}</span>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{description}</p>
            </div>
            <button
                onClick={onRedeem}
                disabled={isLoading}
                className={`mt-8 w-full py-4 bg-white/5 hover:bg-emerald-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all group-hover:shadow-xl group-hover:shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50`}
            >
                {isLoading && <Clock className="animate-spin" size={14} />}
                {t('redeem_reward')}
            </button>
        </div>
    );
}

function LeaderboardItem({ name, score, rank, trend }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
            <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${rank === 1 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{rank}</span>
                <div>
                    <h5 className="font-bold text-white text-sm">{name}</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{score} kg</p>
                </div>
            </div>
            {trend === 'up' ? <TrendingUp size={16} className="text-emerald-500" /> : <div className="w-4 h-1 bg-slate-700 rounded-full"></div>}
        </div>
    );
}

function GuideCategoryCard({ icon, label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-6 border rounded-[2.5rem] gap-4 group transition-all duration-500 ${active
                ? 'bg-emerald-600 border-emerald-500 shadow-[0_15px_40px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 border-white/5 hover:border-emerald-500/30 hover:bg-slate-800/50'
                }`}
        >
            <span className={`text-4xl transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
            <div className="text-center">
                <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${active ? 'text-white' : 'text-white'}`}>{label}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-emerald-100/60' : 'text-slate-500'}`}>{count}</p>
            </div>
        </button>
    );
}
