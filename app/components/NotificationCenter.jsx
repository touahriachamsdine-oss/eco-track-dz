"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '@/app/actions/dashboard';
import { useLanguage } from './LanguageContext';

export default function NotificationCenter() {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const data = await getNotifications();
        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        const res = await markNotificationAsRead(id);
        if (res.success) {
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
            case 'error': return <XCircle className="text-red-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5 active:scale-95"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg shadow-emerald-500/20">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-4 w-96 bg-slate-900 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('notifications')}</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Bell size={32} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">{t('no_new_alerts')}</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.read && handleMarkAsRead(n.id)}
                                        className={`p-5 border-b border-white/5 last:border-0 transition-colors cursor-pointer group hover:bg-white/5 ${!n.read ? 'bg-white/[0.02]' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0">{getTypeIcon(n.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-[11px] font-black uppercase tracking-tight ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.title}</h4>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className={`text-[11px] leading-relaxed ${!n.read ? 'text-slate-300' : 'text-slate-500'}`}>{n.message}</p>
                                                {!n.read && (
                                                    <div className="mt-3 flex items-center gap-1 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                                                        <Check size={10} /> Mark as read
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-4 bg-white/5 text-center">
                                <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">{t('clear_all')}</button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
