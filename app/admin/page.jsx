"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, Map, Truck, Users, Settings, Bell,
    Search, Menu, BarChart3, TrendingUp, AlertTriangle, Activity, Cloud, Wind, Droplets,
    Plus, Trash2, CheckCircle, XCircle, Info, Filter, MoreVertical, PlusCircle, Save, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { getCurrentUser } from '@/app/actions/auth';
import {
    getAdminStats, getBins, getAllTasks, getCollectors, getAllReports,
    updateReportStatus, createGlobalTask, updateBinStatus, updateWasteGuideItem, getWasteGuide
} from '@/app/actions/dashboard';
import LogoutButton from '../components/LogoutButton';
import { useLanguage } from '../components/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NotificationCenter from '../components/NotificationCenter';

const LoadingMap = () => {
    const { t } = useLanguage();
    return <div className="h-full w-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">{t('loading')}</div>;
};

// Dynamic import for Map to avoid SSR issues
const AdminMap = dynamic(() => import('../components/AdminMap'), {
    ssr: false,
    loading: () => <LoadingMap />
});

// Mock Data
const weeklyData = [
    { name: 'Sat', waste: 120, recycling: 45 },
    { name: 'Sun', waste: 132, recycling: 50 },
    { name: 'Mon', waste: 101, recycling: 40 },
    { name: 'Tue', waste: 134, recycling: 55 },
    { name: 'Wed', waste: 125, recycling: 48 },
    { name: 'Thu', waste: 156, recycling: 62 },
    { name: 'Fri', waste: 110, recycling: 38 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalCitizens: 0, activeSensors: 0, fieldReports: 0, collectorFleet: 0 });
    const [bins, setBins] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [reports, setReports] = useState([]);
    const [wasteGuide, setWasteGuide] = useState([]);
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Form States
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showBinModal, setShowBinModal] = useState(false);
    const [editingGuideItem, setEditingGuideItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getCurrentUser();
            setUser(userData);

            const adminStats = await getAdminStats();
            setStats(adminStats);

            const binsData = await getBins();
            setBins(binsData);

            const tasksData = await getAllTasks();
            setTasks(tasksData);

            const collectorsData = await getCollectors();
            setCollectors(collectorsData);

            const reportsData = await getAllReports();
            setReports(reportsData);

            const guideData = await getWasteGuide();
            setWasteGuide(guideData);
        };
        fetchData();

        // Refresh dynamic data every 30s
        const interval = setInterval(fetchData, 30000);

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

    const sidebarItems = [
        { id: 'overview', icon: <LayoutDashboard size={20} />, label: t('overview') },
        { id: 'map', icon: <Map size={20} />, label: t('global_map') },
        { id: 'fleet', icon: <Truck size={20} />, label: t('fleet_ops') },
        { id: 'collectors', icon: <Users size={20} />, label: t('personnel') },
        { id: 'reports', icon: <AlertTriangle size={20} />, label: t('field_reports') },
        { id: 'intelligence', icon: <Activity size={20} />, label: t('intelligence') },
    ];

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const res = await createGlobalTask({
            address: formData.get('address'),
            type: formData.get('type'),
            bins: parseInt(formData.get('bins')),
            collectorId: formData.get('collectorId')
        });
        if (res.success) {
            setShowTaskModal(false);
            const tasksData = await getAllTasks();
            setTasks(tasksData);
        }
    };

    const handleUpdateReport = async (id, status) => {
        const res = await updateReportStatus(id, status);
        if (res.success) {
            const reportsData = await getAllReports();
            setReports(reportsData);
        }
    };

    return (
        <div className={`flex min-h-screen bg-[#020617] text-slate-100 selection:bg-emerald-500/30 ${language === 'ar' || language === 'ber' ? 'font-[Cairo]' : ''}`} dir={language === 'ar' || language === 'ber' ? 'rtl' : 'ltr'}>
            {/* Nav Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/80 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-8">
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                            <Activity size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white leading-none">EcoTrack</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1">{t('admin_hq')}</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5 flex-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                    }`}
                            >
                                <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-600 group-hover:text-emerald-500'} transition-colors`}>
                                    {item.icon}
                                </div>
                                <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                        <LanguageSwitcher />
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
                {/* Global Header */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-white"><Menu size={24} /></button>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('admin_matrix')}</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-0.5">{t('system_nominal')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl">
                            <Cloud size={16} className="text-blue-400" />
                            <span className="text-xs font-bold text-slate-300">Algiers: 18°C</span>
                        </div>
                        <NotificationCenter />
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs font-black text-emerald-500">
                            HQ
                        </div>
                    </div>
                </header>

                <div className="p-10">
                    {activeTab === 'overview' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Key Performance Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <StatsCard label={t('total_citizens')} value={stats.totalCitizens} trend="+12% {this_month}" icon={<Users />} color="emerald" />
                                <StatsCard label={t('active_sensors')} value={bins.length} trend="99.2% Online" icon={<Activity />} color="blue" />
                                <StatsCard label={t('field_reports')} value={reports.length} trend="+4 Reported" icon={<AlertTriangle />} color="amber" />
                                <StatsCard label={t('field_fleet')} value={collectors.length} trend="08 in Transit" icon={<Truck />} color="purple" />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                {/* Analytics Core */}
                                <div className="xl:col-span-8 bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                                    <div className="flex justify-between items-end mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{t('performance_matrix')}</h3>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{t('performance_matrix_desc')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase">Waste</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[10px] font-black text-blue-500 uppercase">Recycling</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[450px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyData}>
                                                <defs>
                                                    <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 10 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 10 }} />
                                                <RechartsTooltip
                                                    contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '1rem', color: '#fff' }}
                                                />
                                                <Bar dataKey="waste" fill="url(#wasteGradient)" radius={[10, 10, 0, 0]} />
                                                <Bar dataKey="recycling" fill="#3b82f6" opacity={0.3} radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Live Feed */}
                                <div className="xl:col-span-4 bg-slate-900/50 border border-white/5 rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
                                    <div className="p-8 border-b border-white/5">
                                        <h3 className="text-xl font-black text-white uppercase tracking-widest">{t('intelligence_feed')}</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {reports.map(report => (
                                            <div key={report.id} className="p-5 bg-black/20 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Signal Reported</span>
                                                    <span className="text-[9px] font-bold text-slate-600">
                                                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">{report.address}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{report.type}</p>
                                            </div>
                                        ))}
                                        {reports.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                                <Activity size={48} className="mb-4" />
                                                <p className="font-black uppercase tracking-widest text-xs">{t('no_matrix_signals')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="h-[750px] bg-slate-900 border border-white/5 rounded-[4rem] p-3 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative animate-in zoom-in-95 duration-700">
                            <div className="absolute top-10 left-10 z-[40] bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl">
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{t('global_fleet_ops')}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-10">{t('fleet_ops_desc_admin')}</p>
                                <div className="space-y-4">
                                    <MapIntelligenceMetric label={t('active_sensors')} value={`${bins.length} ${t('active')}`} color="emerald" />
                                    <MapIntelligenceMetric label={t('active_missions')} value={`${tasks.length} ${t('active')}`} color="indigo" />
                                    <MapIntelligenceMetric label={t('field_reports')} value={`${reports.length} ${t('signals')}`} color="blue" />
                                </div>
                            </div>
                            <AdminMap bins={bins} tasks={tasks} />
                        </div>
                    )}

                    {activeTab === 'fleet' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter">{t('fleet_logistics')}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{t('vehicle_status_desc')}</p>
                                </div>
                                <button onClick={() => setShowTaskModal(true)} className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center gap-3">
                                    <Plus size={18} />
                                    {t('deploy_mission')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {tasks.map(task => (
                                    <FleetUnitCard key={task.id} id={`M-7${task.id.slice(-3).toUpperCase()}`} status={task.status} efficiency={task.status === 'completed' ? '100%' : 'pending'} driver={task.collector?.name || 'Unassigned'} color={task.status === 'pending' ? 'amber' : 'emerald'} />
                                ))}
                                {tasks.length === 0 && (
                                    <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center opacity-30">
                                        <Truck size={64} className="mx-auto mb-6" />
                                        <p className="text-xl font-black uppercase tracking-widest">{t('no_active_missions')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'collectors' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter">{t('personnel')}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{t('governance_desc')}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-4 shadow-2xl overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('agent_profile')}</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('assigned_fleet')}</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('merit_points')}</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('role')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {collectors.map((collector) => (
                                            <tr key={collector.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-lg font-black text-white border border-white/5 group-hover:border-emerald-500/30 transition-all">
                                                            {collector.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-white">{collector.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{collector.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <Truck size={14} className="text-blue-500" />
                                                        <span className="text-sm font-bold text-slate-300">Unit-DZ402</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="text-sm font-black text-emerald-500">1,240 pts</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Collector</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter">Field Signals</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">Incoming Citizen Transmissions</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {reports.map(report => (
                                    <div key={report.id} className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 hover:border-amber-500/30 transition-all group shadow-2xl relative overflow-hidden">
                                        {report.status === 'pending' && <div className="absolute top-0 right-0 p-8"><span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping"></span></div>}
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                    {report.status === 'pending' ? 'Live Alert' : 'Resolved'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(report.createdAt).toLocaleDateString()} · {new Date(report.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-white mb-2 leading-tight">{report.address || report.location}</h4>
                                        <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-6">{report.type}</p>

                                        {report.imageUrl && (
                                            <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-xl group/img relative">
                                                <img src={report.imageUrl} alt="Evidence" className="w-full h-48 object-cover group-hover/img:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-6">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest self-end">Visual Intelligence Data</span>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">{report.description}</p>
                                        <div className="flex gap-4 pt-8 border-t border-white/5">
                                            {report.status === 'pending' ? (
                                                <button onClick={() => handleUpdateReport(report.id, 'resolved')} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                                                    <CheckCircle size={16} /> {t('resolve')}
                                                </button>
                                            ) : (
                                                <div className="flex-1 py-4 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                                    {t('actioned_by_hq')}
                                                </div>
                                            )}
                                            <button onClick={() => handleUpdateReport(report.id, 'dismissed')} className="px-8 py-4 bg-slate-800 hover:bg-red-500 group-hover:bg-red-500 text-slate-500 group-hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                                                {t('dismiss')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {reports.length === 0 && (
                                    <div className="col-span-full py-60 border-2 border-dashed border-white/5 rounded-[4rem] text-center opacity-30">
                                        <AlertTriangle size={64} className="mx-auto mb-6" />
                                        <p className="text-xl font-black uppercase tracking-widest">{t('matrix_silence')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'intelligence' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter">{t('intelligence')}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{t('hq_protocols')}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const loc = prompt("Enter location name:");
                                        const type = prompt("Enter type (Recycling/General/Medical):");
                                        const lat = parseFloat(prompt("Latitude:"));
                                        const lng = parseFloat(prompt("Longitude:"));
                                        if (loc && type && !isNaN(lat)) {
                                            // Call backend action here to create bin
                                        }
                                    }}
                                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-600/20"
                                >
                                    {t('init_data_node')}
                                </button>
                            </div>

                            <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-10 overflow-hidden shadow-2xl">
                                <h4 className="text-xl font-black text-white mb-10 uppercase tracking-widest">{t('intelligence_matrix')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {wasteGuide.map((item) => (
                                        <div key={item.id} className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-6">
                                                <h5 className="text-xl font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{item.item}</h5>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingGuideItem(item)} className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"><Settings size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <span>Protocol</span>
                                                    <span className="text-emerald-500">{item.category}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 line-clamp-2">{item.disposal}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Mission Deployment Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-500">
                    <div className="bg-slate-900 w-full max-w-2xl rounded-[4rem] border border-white/10 shadow-full p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                        <button onClick={() => setShowTaskModal(false)} className="absolute top-10 right-10 p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={24} /></button>

                        <div className="mb-10 text-center">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t('mission_deployment')}</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{t('mission_deployment_desc')}</p>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t('target_address')}</label>
                                <input name="address" required className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold" placeholder="E.g., Bab El Oued District, Algiers" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t('deployment_type')}</label>
                                    <select name="type" className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500 font-bold">
                                        <option>General</option>
                                        <option>Recycling</option>
                                        <option>Medical</option>
                                        <option>Hazardous</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t('bin_capacity')}</label>
                                    <input name="bins" type="number" defaultValue="1" min="1" className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500 font-bold" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t('field_assignment')}</label>
                                <select name="collectorId" className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500 font-bold">
                                    {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-600/30 transition-all active:scale-95 mt-4">
                                {t('finalize_deployment')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ label, value, trend, icon, color }) {
    const colors = {
        emerald: 'text-emerald-500 bg-emerald-500/10',
        blue: 'text-blue-500 bg-blue-500/10',
        amber: 'text-amber-500 bg-amber-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] hover:bg-slate-900 transition-all group shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colors[color]}`}>
                    {icon}
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-black text-white tracking-tight">{value}</p>
                    <p className={`text-[10px] font-bold uppercase ${color === 'emerald' ? 'text-emerald-500' : 'text-slate-500'}`}>{trend}</p>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
        </div>
    );
}

function FleetUnitCard({ id, status, efficiency, driver, color }) {
    const statusColor = status === 'completed' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20';

    return (
        <div className="bg-slate-900 border border-white/5 p-10 rounded-[3.5rem] hover:border-white/20 transition-all group shadow-2xl relative">
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{id}</span>
                </div>
                <MoreVertical size={16} className="text-slate-500 cursor-pointer" />
            </div>

            <div className="space-y-8">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Mission</p>
                    <p className="text-lg font-black text-white truncate">{driver}</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{status === 'completed' ? 'Efficiency' : 'Status'}</p>
                        <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest border ${statusColor}`}>
                            {efficiency}
                        </span>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex gap-4">
                    <button className="flex-1 py-4 bg-slate-800 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Track System</button>
                    <button className="p-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all"><Settings size={18} /></button>
                </div>
            </div>
        </div>
    );
}

function MapIntelligenceMetric({ label, value, color }) {
    const colors = {
        emerald: 'bg-emerald-500',
        indigo: 'bg-indigo-500',
        blue: 'bg-blue-500',
    };

    return (
        <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className={`w-1.5 h-1.5 rounded-full ${colors[color]} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-black text-white uppercase">{value}</span>
        </div>
    );
}
