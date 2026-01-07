"use client";

import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Camera, RefreshCw, X, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { awardPoints } from '@/app/actions/dashboard';

const WASTE_CATEGORIES = {
    ORGANIC: {
        label: 'Organic',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: '🍎',
        instructions: 'Compost this item or dispose in the brown bin. Avoid plastic bags.'
    },
    RECYCLABLE: {
        label: 'Recyclable',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: '♻️',
        instructions: 'Rinse if possible and place in the green/blue recycling bin.'
    },
    HAZARDOUS: {
        label: 'Hazardous',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: '⚠️',
        instructions: 'Do NOT throw in regular trash. Take to a specialized collection point.'
    },
    GENERAL: {
        label: 'General Waste',
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        icon: '🗑️',
        instructions: 'Dispose in the regular grey/black bin.'
    }
};

const CLASS_MAPPING = {
    // ORGANIC
    'banana': 'ORGANIC',
    'apple': 'ORGANIC',
    'orange': 'ORGANIC',
    'broccoli': 'ORGANIC',
    'sandwich': 'ORGANIC',
    'carrot': 'ORGANIC',
    'hot dog': 'ORGANIC',
    'pizza': 'ORGANIC',
    'donut': 'ORGANIC',
    'cake': 'ORGANIC',

    // RECYCLABLE
    'bottle': 'RECYCLABLE',
    'wine glass': 'RECYCLABLE',
    'cup': 'RECYCLABLE',
    'fork': 'RECYCLABLE',
    'knife': 'RECYCLABLE',
    'spoon': 'RECYCLABLE',
    'bowl': 'RECYCLABLE',
    'can': 'RECYCLABLE',

    // HAZARDOUS
    'laptop': 'HAZARDOUS',
    'cell phone': 'HAZARDOUS',
    'tv': 'HAZARDOUS',
    'microwave': 'HAZARDOUS',
    'oven': 'HAZARDOUS',
    'toaster': 'HAZARDOUS',
    'refrigerator': 'HAZARDOUS',
    'clock': 'HAZARDOUS',
    'scissors': 'HAZARDOUS',
    'keyboard': 'HAZARDOUS',
    'mouse': 'HAZARDOUS',
};

export default function WasteScanner({ onClose }) {
    const { t } = useLanguage();
    const videoRef = useRef(null);
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [pointsAwarded, setPointsAwarded] = useState(false);

    useEffect(() => {
        async function loadModel() {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load({
                    base: 'lite_mobilenet_v2' // Faster for browser
                });
                setModel(loadedModel);
                setIsLoading(false);
                startCamera();
            } catch (err) {
                console.error("Failed to load model:", err);
                setError(t('could_not_init_ai'));
                setIsLoading(false);
            }
        }
        loadModel();

        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError(t('camera_denied'));
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const runInference = async () => {
        if (!model || !videoRef.current) return;

        setIsScanning(true);
        try {
            const predictions = await model.detect(videoRef.current);
            console.log("Detections:", predictions);

            if (predictions.length > 0) {
                const topResult = predictions.sort((a, b) => b.score - a.score)[0];
                const categoryKey = CLASS_MAPPING[topResult.class.toLowerCase()] || 'GENERAL';

                setPrediction({
                    class: topResult.class,
                    score: topResult.score,
                    categoryKey: categoryKey
                });
            } else {
                setPrediction({
                    class: 'Unknown Object',
                    score: 0,
                    categoryKey: 'GENERAL'
                });
            }
        } catch (err) {
            console.error("Inference error:", err);
        }
        setIsScanning(false);
    };

    const handleAwardPoints = async () => {
        if (pointsAwarded || !prediction) return;
        setPointsAwarded(true);
        await awardPoints(10, `using AI Vision to classify ${prediction.class}`);
    };

    useEffect(() => {
        if (prediction && !pointsAwarded) {
            handleAwardPoints();
        }
    }, [prediction]);

    const getCategoryData = (key) => {
        const categories = {
            ORGANIC: { label: t('organic'), color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🍎', instr: t('organic_instr') },
            RECYCLABLE: { label: t('recyclable'), color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '♻️', instr: t('recyclable_instr') },
            HAZARDOUS: { label: t('hazardous'), color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '⚠️', instr: t('hazardous_instr') },
            GENERAL: { label: t('general_waste'), color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: '🗑️', instr: t('general_instr') }
        };
        return categories[key] || categories.GENERAL;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <Zap className="text-emerald-500 fill-emerald-500" size={24} />
                            Smart Vision Pro
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{t('realtime_detection')}</p>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative aspect-video bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Viewfinder overlay */}
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                        <div className="w-full h-full border-2 border-emerald-500/30 rounded-2xl relative">
                            {/* Scanning line animation */}
                            {isScanning && (
                                <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan-line"></div>
                            )}
                        </div>
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80">
                            <RefreshCw className="text-emerald-500 animate-spin mb-4" size={48} />
                            <p className="text-sm font-black text-white uppercase tracking-[0.2em]">{t('loading_ai')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 p-8 text-center">
                            <AlertCircle className="text-red-500 mb-4" size={48} />
                            <p className="text-white font-bold mb-2">{error}</p>
                            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm">{t('retry')}</button>
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                <div className="p-10 bg-gradient-to-b from-slate-900 to-black">
                    {!prediction ? (
                        <div className="flex flex-col items-center gap-6 py-4">
                            <p className="text-slate-400 font-medium text-center max-w-md">{t('ai_instructions')}</p>
                            <button
                                onClick={runInference}
                                disabled={isLoading || isScanning}
                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Camera size={24} />
                                {t('scan_now')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {(() => {
                                const cat = getCategoryData(prediction.categoryKey);
                                return (
                                    <div className={`p-8 rounded-[2rem] border transition-all ${cat.bg} ${cat.border}`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <span className="text-5xl">{cat.icon}</span>
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${cat.color}`}>{t('detected')}: {prediction.class}</p>
                                                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{cat.label}</h4>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('confidence')}</p>
                                                <p className="text-2xl font-black text-white">{(prediction.score * 100).toFixed(0)}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                                {cat.instr}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            <button
                                onClick={() => { setPrediction(null); setPointsAwarded(false); }}
                                className="w-full py-4 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} /> {t('scan_another')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan-line {
                    0% { top: 0% }
                    100% { top: 100% }
                }
                .animate-scan-line {
                    animation: scan-line 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
