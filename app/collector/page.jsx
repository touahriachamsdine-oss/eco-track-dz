"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MessageSquare, Camera, Clock, CheckSquare, X, LogOut,
    Navigation, MapPin, AlertTriangle, CheckCircle,
    Menu, Bell, Truck, Activity, ChevronRight, Search, TrendingUp, Trash2
} from 'lucide-react';
import { getCurrentUser, logout } from '@/app/actions/auth';
import { getCollectorTasks, updateTaskStatus, getMessages, sendMessage, reportCollectorIssue, getBins, getFullUserData } from '@/app/actions/dashboard';
import { useLanguage } from '../components/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import dynamic from 'next/dynamic';
import WasteScanner from '../components/WasteScanner';
import EcoAssistant from '../components/EcoAssistant';
import NotificationCenter from '../components/NotificationCenter';
import { Zap } from 'lucide-react';

const LoadingMap = () => {
    const { t } = useLanguage();
    return <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">{t('loading')}</div>;
};

const AdminMap = dynamic(() => import('../components/AdminMap'), {
    ssr: false,
    loading: () => <LoadingMap />
});

export default function CollectorApp() {
    const { t, language } = useLanguage();
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('route');
    const [showMessages, setShowMessages] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [user, setUser] = useState(null);
    const [bins, setBins] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedTaskForIssue, setSelectedTaskForIssue] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const [selectedIssueType, setSelectedIssueType] = useState('Road Blocked');

    const handleReportIssue = async (e) => {
        e.preventDefault();
        const type = e.target.type.value;
        const description = e.target.description.value;
        const taskId = selectedTaskForIssue?.id || 'general';
        const res = await reportCollectorIssue(taskId, type, description);
        if (res.success) {
            setShowIssueModal(false);
            setSelectedTaskForIssue(null);
            alert('Issue reported to HQ');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getFullUserData();
            setUser(userData);
            const taskData = await getCollectorTasks();
            setTasks(taskData);
            const msgData = await getMessages();
            setMessages(msgData);
            const binsData = await getBins();
            setBins(binsData);
        };
        fetchData();

        const interval = setInterval(async () => {
            const data = await getMessages();
            setMessages(data);
        }, 5000);

        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const completeTask = async (id) => {
        const res = await updateTaskStatus(id, 'completed');
        if (res.success) {
            const taskData = await getCollectorTasks();
            setTasks(taskData);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const res = await sendMessage(newMessage, 'admin');
        if (res.success) {
            setNewMessage('');
            const data = await getMessages();
            setMessages(data);
        }
    };

    const sidebarItems = [
        { id: 'route', icon: <Navigation size={22} />, label: t('route_intel') },
        { id: 'map', icon: <MapPin size={22} />, label: t('zone_tracking') },
        { id: 'issues', icon: <AlertTriangle size={22} />, label: t('issue_reporting') },
        { id: 'comm', icon: <MessageSquare size={22} />, label: t('communication') },
    ];

    return (
        <div className={`flex min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30 font-sans ${language === 'ar' || language === 'ber' ? 'font-[Cairo]' : ''}`} dir={language === 'ar' || language === 'ber' ? 'rtl' : 'ltr'}>
            {/* Nav Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-950/80 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-8">
                    <div className="flex items-center gap-4 mb-14 px-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                            <Truck size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white leading-none">EcoTrack</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-1">{t('collector_ops')}</p>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ms-auto text-slate-500"><X size={24} /></button>
                    </div>

                    <nav className="space-y-2 flex-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                    }`}
                            >
                                <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-600 group-hover:text-blue-500'} transition-colors`}>
                                    {item.icon}
                                </div>
                                <span className="font-black uppercase tracking-widest text-xs">{item.label}</span>
                                {activeTab === item.id && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]"></div>}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-8 border-t border-white/5">
                        <div className="bg-slate-900/50 rounded-[2.5rem] p-6 mb-6 border border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-xl font-black text-white">402</div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('driver_id')}</p>
                                    <p className="text-sm font-black text-white tracking-tight">{user?.name || 'Loading...'}</p>
                                </div>
                            </div>
                            <div className="space-y-4 mb-6">
                                {user?.vehicleType && (
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Vehicle</p>
                                        <p className="text-xs font-bold text-blue-400">{user.vehicleType}</p>
                                    </div>
                                )}
                                {user?.specialization && (
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Specialization</p>
                                        <p className="text-xs font-bold text-emerald-400">{user.specialization}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                        <span>{t('shift_progress')}</span>
                                        <span className="text-emerald-500">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <form action={logout} className="flex-1">
                                <button className="w-full h-14 bg-slate-900 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-xs border border-white/5">
                                    <LogOut size={18} /> {t('logout')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
                <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-8 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-3 bg-slate-900 rounded-xl ${isSidebarOpen ? 'hidden' : 'block'}`}><Menu size={24} /></button>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {activeTab === 'route' && t('route_intel')}
                                {activeTab === 'map' && t('zone_tracking')}
                                {activeTab === 'issues' && t('issue_reporting')}
                                {activeTab === 'comm' && t('communication')}
                            </h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{t('zone_info')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end px-6 border-r border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Sync</p>
                            <p className="text-sm font-black text-emerald-500 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                                LIVE
                            </p>
                        </div>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="relative w-14 h-14 rounded-2xl bg-blue-600 border border-blue-500/50 flex items-center justify-center transition-all hover:bg-blue-500 group shadow-xl shadow-blue-600/20"
                        >
                            <Zap size={24} className="text-white fill-white" />
                        </button>
                        <NotificationCenter />
                    </div>
                </header>

                {/* AI Scanner Integration */}
                {showScanner && <WasteScanner onClose={() => setShowScanner(false)} />}

                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <StatusCard icon={<Clock />} label={t('estimated')} value="04h 22m" sub="Shift End" color="blue" />
                        <StatusCard icon={<CheckSquare />} label={t('complete')} value={`${completedTasks}/${totalTasks}`} sub="Missions" color="emerald" />
                        <StatusCard icon={<Activity />} label={t('fuel_status')} value="84%" sub="Diesel" color="amber" />
                        <StatusCard icon={<TrendingUp />} label={t('opt')} value="9.4/10" sub="Route Score" color="purple" />
                    </div>

                    <div className="min-h-[600px] relative">
                        {activeTab === 'route' && (
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Tasks Section */}
                                <div className="xl:col-span-7 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider flex items-center gap-3">
                                            <Navigation size={24} className="text-blue-500" /> {t('assigned_tasks')}
                                        </h3>
                                        <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('live_updates')}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                // Mock optimization
                                                alert("AI Engine is calculating the most efficient path...");
                                                setTimeout(() => {
                                                    setTasks([...tasks].sort(() => Math.random() - 0.5));
                                                }, 1000);
                                            }}
                                            className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20"
                                        >
                                            Auto-Optimize Route
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {tasks.length > 0 ? tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`group relative bg-slate-900/40 hover:bg-slate-900/60 border ${task.status === 'completed' ? 'border-emerald-500/20 opacity-60' : 'border-white/5 hover:border-white/10 shadow-2xl'} p-8 rounded-[3rem] flex items-center gap-8 transition-all duration-500`}
                                            >
                                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center flex-shrink-0 border-2 transition-transform group-hover:scale-105 ${task.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-800 border-white/5 text-blue-500'}`}>
                                                    {task.status === 'completed' ? <CheckCircle size={40} /> : <MapPin size={40} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <h4 className="font-black text-2xl text-white truncate">{task.address}</h4>
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${task.type === 'Medical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : task.type === 'Recycling' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border-white/5'}`}>{task.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-sm font-bold text-slate-500 flex items-center gap-2"><Clock size={16} className="text-blue-500/50" /> {t('estimated')} {task.time || '08:00 AM'}</p>
                                                        <p className="text-sm font-bold text-slate-500 flex items-center gap-2"><Activity size={16} className="text-emerald-500/50" /> {task.bins} {t('bin_units')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    {task.status !== 'completed' ? (
                                                        <>
                                                            <button onClick={() => completeTask(task.id)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest active:scale-95">{t('mark_complete')}</button>
                                                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-white/5 transition-all"><Navigation size={20} /></a>
                                                            <button onClick={() => { setSelectedTaskForIssue(task); setShowIssueModal(true); }} className="p-4 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-500 rounded-2xl border border-white/5 transition-all"><AlertTriangle size={20} /></button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-4 text-emerald-500 font-black uppercase tracking-tighter text-sm px-6">
                                                            <CheckCircle size={20} /> MISSION ARCHIVED
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center opacity-30">
                                                <Truck size={64} className="mx-auto mb-6" />
                                                <p className="text-2xl font-black uppercase tracking-widest">{t('no_tasks')}</p>
                                                <p className="text-sm mt-4 font-bold max-w-sm mx-auto uppercase tracking-wider">{t('contact_hq_error')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Stats Panel */}
                                <div className="xl:col-span-5 space-y-8">
                                    <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                                        <h4 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-4">
                                            <TrendingUp size={24} className="text-blue-500" /> Operational Metrics
                                        </h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/30 transition-all">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Route Progress</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-white tracking-tighter">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 group hover:border-emerald-500/30 transition-all">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Carbon Impact</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-white tracking-tighter">1.2</span>
                                                    <span className="text-xs font-black text-emerald-500 uppercase">Tons</span>
                                                </div>
                                                <p className="mt-4 text-[10px] font-bold text-slate-600 uppercase">CO2 Offset Shift</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-2 overflow-hidden h-[400px] shadow-2xl relative group">
                                        <div className="absolute top-6 left-6 z-[40] bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('zone_tracking')}</span>
                                        </div>
                                        <AdminMap tasks={tasks} bins={bins} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="h-[750px] bg-slate-900 border border-white/5 rounded-[4rem] p-3 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative animate-in zoom-in-95 duration-700">
                                <AdminMap tasks={tasks} bins={bins} />
                                <div className="absolute top-10 left-10 z-[40] bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl">
                                    <h4 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{t('route_intel')}</h4>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">{t('route_intel_desc')}</p>
                                    <div className="space-y-4">
                                        <IntelligenceCard icon={<Activity size={18} />} label={t('sensor_status')} value="Online" color="emerald" />
                                        <IntelligenceCard icon={<Navigation size={18} />} label={t('path_optimization')} value="Active" color="blue" />
                                        <IntelligenceCard icon={<Truck size={18} />} label={t('vehicle_logic')} value="Fluent" color="purple" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'issues' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl">
                                    <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">{t('create_alert')}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed mb-10">{t('zone_disruptions')}</p>

                                    <form onSubmit={handleReportIssue} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'Road Blocked', label: t('road_blocked'), icon: <X /> },
                                                { id: 'Vehicle Issue', label: t('vehicle_issue'), icon: <Truck /> },
                                                { id: 'Hazardous Area', label: t('hazardous_area'), icon: <AlertTriangle /> },
                                                { id: 'Bin Broken', label: t('bin_broken'), icon: <Trash2 /> },
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setSelectedIssueType(type.id)}
                                                    className={`p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all ${selectedIssueType === type.id
                                                        ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20 scale-[1.05] z-10'
                                                        : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10'
                                                        }`}
                                                >
                                                    {type.icon}
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{type.label}</span>
                                                </button>
                                            ))}
                                            <input type="hidden" name="type" value={selectedIssueType} />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('describe_problem')}</label>
                                            <textarea
                                                name="description"
                                                className="w-full bg-slate-800/50 border border-white/5 rounded-[2rem] p-8 text-white focus:outline-none focus:border-blue-500/50 transition-all min-h-[200px] text-lg font-medium"
                                                placeholder={t('description_placeholder')}
                                            ></textarea>
                                        </div>

                                        <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-600/30 transition-all active:scale-95">
                                            Broadcast Alert to HQ
                                        </button>
                                    </form>
                                </div>

                                <div className="space-y-10">
                                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl">
                                        <h4 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">{t('logbook')}</h4>
                                        <div className="space-y-6">
                                            <LogItem time="08:00 AM" label={t('shift_start_protocol')} status={t('verified')} active />
                                            <LogItem time="08:15 AM" label={t('zone_entry_a4')} status={t('established')} active />
                                            <LogItem time="09:30 AM" label={t('pre_trip_desc')} status={t('complete')} />
                                            <LogItem time="10:00 AM" label={t('live_conn_desc')} status={t('verified')} />
                                        </div>
                                    </div>
                                    <div className="bg-blue-600 rounded-[4rem] p-12 text-white shadow-2xl shadow-blue-600/20 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                        <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter">Emergency HQ Line</h4>
                                        <p className="text-blue-100 font-medium leading-relaxed mb-8">Priority protocol for critical field hazards and equipment failures.</p>
                                        <button className="px-10 py-5 bg-white text-blue-600 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:shadow-2xl">Dispatch SOS</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'comm' && (
                            <div className="h-[750px] bg-slate-900 border border-white/5 rounded-[4rem] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="p-10 border-b border-white/5 bg-slate-800/20 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{t('hq_contact')}</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{t('comm_desc')}</p>
                                    </div>
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-blue-500 flex items-center justify-center text-xs font-black">HQ</div>
                                        <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-xs font-black">DZ</div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-6 rounded-[2rem] ${msg.senderId === user?.id
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                                                }`}>
                                                <p className="font-medium text-lg mb-2 leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${msg.senderId === user?.id ? 'text-blue-200' : 'text-slate-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                                            <MessageSquare size={64} className="mb-6" />
                                            <p className="text-2xl font-black uppercase tracking-widest">No active transmissions</p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSendMessage} className="p-10 bg-slate-800/30 border-t border-white/5 backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
                                    <div className="flex gap-6">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={t('type_message')}
                                            className="flex-1 bg-slate-900 border border-white/5 rounded-3xl px-10 py-6 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-medium"
                                        />
                                        <button type="submit" className="w-20 h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                                            <ChevronRight size={32} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60 animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-2xl rounded-[4rem] border border-white/10 shadow-full p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        <button onClick={() => setShowIssueModal(false)} className="absolute top-10 right-10 p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={24} /></button>

                        <div className="mb-10">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t('report_issue')}</h3>
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Case ID: {selectedTaskForIssue ? `TASK-${selectedTaskForIssue.id}` : 'GENERAL'}</p>
                        </div>

                        <form onSubmit={handleReportIssue} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('issue_type')}</label>
                                <select name="type" className="w-full bg-slate-800 border border-white/5 rounded-2xl p-6 text-white text-lg font-bold focus:outline-none focus:border-blue-500">
                                    <option>{t('road_blocked')}</option>
                                    <option>{t('vehicle_issue')}</option>
                                    <option>{t('hazardous_area')}</option>
                                    <option>{t('bin_broken')}</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('additional_context')}</label>
                                <textarea name="description" className="w-full bg-slate-800 border border-white/5 rounded-[2rem] p-8 text-white min-h-[150px] font-medium text-lg leading-relaxed focus:outline-none focus:border-blue-500" placeholder={t('describe_problem')}></textarea>
                            </div>

                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-600/30 transition-all active:scale-95">
                                Finalize Protocol Alert
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <EcoAssistant />
        </div>
    );
}

function StatusCard({ icon, label, value, sub, color }) {
    const colors = {
        blue: 'text-blue-500 bg-blue-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        amber: 'text-amber-500 bg-amber-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] hover:bg-slate-900 transition-all group shadow-2xl">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase">{sub}</p>
            </div>
        </div>
    );
}

function IntelligenceCard({ icon, label, value, color }) {
    const colors = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-slate-800 text-slate-400`}>
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${colors[color]} animate-pulse`}></div>
                <span className="text-xs font-black text-white uppercase">{value}</span>
            </div>
        </div>
    );
}

function LogItem({ time, label, status, active }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest w-20">{time}</span>
                <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500' : 'bg-slate-700'} relative`}>
                    {active && <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>}
                </div>
                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${active ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>{status}</span>
        </div>
    );
}
