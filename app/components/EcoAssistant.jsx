"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Bot, Leaf } from 'lucide-react';

const KNOWLEDGE_BASE = {
    "recycling": "In Algiers, plastic bottles, glass, and cardboard should go to the yellow or blue bins where available. Rinse your plastics first!",
    "organic": "Food waste can be composted. Avoid putting plastic bags in the organic bin as they contaminate the compost.",
    "hazard": "Batteries and electronics contain toxic chemicals. Please use the 'Report Issue' feature to request a hazardous waste pickup.",
    "points": "You earn 50 points for every issue report and 10 points for every AI scan. You can spend them in the Marketplace!",
    "schedule": "Check the 'Pickup Schedule' tab to see when trucks are coming to your neighborhood.",
    "default": "I'm still learning! You can ask me about recycling, points, or waste schedules. For urgent issues, please use the Report button."
};

export default function EcoAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm your Eco-Assistant. How can I help you save the planet today?" }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI Thinking
        setTimeout(() => {
            let response = KNOWLEDGE_BASE.default;
            const lowInput = input.toLowerCase();

            if (lowInput.includes('recycl')) response = KNOWLEDGE_BASE.recycling;
            else if (lowInput.includes('food') || lowInput.includes('organic')) response = KNOWLEDGE_BASE.organic;
            else if (lowInput.includes('battery') || lowInput.includes('electronic')) response = KNOWLEDGE_BASE.hazard;
            else if (lowInput.includes('point') || lowInput.includes('credit')) response = KNOWLEDGE_BASE.points;
            else if (lowInput.includes('time') || lowInput.includes('when') || lowInput.includes('schedule')) response = KNOWLEDGE_BASE.schedule;

            setMessages(prev => [...prev, { role: 'bot', content: response }]);
        }, 800);
    };

    return (
        <div className="fixed bottom-10 right-10 z-[300]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-emerald-500 hover:scale-110 active:scale-95 shadow-emerald-500/40'}`}
            >
                {isOpen ? <X className="text-white" size={24} /> : <MessageSquare className="text-white" size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white animate-pulse"></span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
                    {/* Header */}
                    <div className="p-8 bg-gradient-to-r from-emerald-600 to-emerald-400">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Bot className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-tight text-lg">Eco Intelligence</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Always Learning</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${msg.role === 'user'
                                        ? 'bg-emerald-500 text-white rounded-tr-none shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Questions */}
                    <div className="px-8 pb-4 flex flex-wrap gap-2">
                        {['Recycling', 'Points', 'Schedules'].map(q => (
                            <button
                                key={q}
                                onClick={() => { setInput(q); handleSend(); }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
                            >
                                {q}?
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-8 border-t border-white/5 bg-black/20">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all pr-14"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white hover:bg-emerald-400 transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="mt-4 text-[9px] text-center font-black text-slate-600 uppercase tracking-widest">EcoTrack AI Assistant v1.0</p>
                    </div>
                </div>
            )}
        </div>
    );
}
