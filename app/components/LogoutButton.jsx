'use client';

import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ variant = 'default' }) {
    return (
        <button
            onClick={() => logout()}
            className={
                variant === 'sidebar'
                    ? "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-black uppercase tracking-widest mt-4 border border-transparent hover:border-red-500/10"
                    : "flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-sm font-black uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-500/5"
            }
        >
            <LogOut size={18} />
            <span>Log Out</span>
        </button>
    );
}
