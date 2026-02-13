
import React, { useState } from 'react';
import { Landmark, TrendingUp, DollarSign, BarChart2, Activity, Info, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const FundamentalPanel = ({ stock }) => {
    const { fundamentals } = stock;
    const [activeValuation, setActiveValuation] = useState(fundamentals.valuation || 'Fair');

    const metrics = [
        { label: 'Market Cap', value: stock.marketCap, icon: <Landmark size={14} />, tip: 'Total market value of a company\'s outstanding shares.' },
        { label: 'P/E Ratio', value: fundamentals.pe, icon: <Activity size={14} />, tip: 'Price-to-Earnings: How much investors pay for $1 of earnings.' },
        { label: 'EPS (TTM)', value: fundamentals.eps, icon: <DollarSign size={14} />, tip: 'Earnings Per Share for the trailing twelve months.' },
        { label: 'Revenue Growth', value: fundamentals.growth, icon: <TrendingUp size={14} />, color: 'text-buy', tip: 'Year-over-year increase in company revenue.' },
        { label: 'Dividend Yield', value: '0.00%', icon: <BarChart2 size={14} />, tip: 'Dividend payout relative to share price.' },
        { label: 'Debt/Equity', value: '1.24', icon: <Landmark size={14} />, tip: 'Compares total liabilities to shareholder equity.' },
    ];

    const getValColor = () => {
        if (activeValuation === 'Cheap') return '#10b981';
        if (activeValuation === 'Expensive') return '#ef4444';
        return '#3b82f6';
    };

    return (
        <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] border-b border-border pb-2 inline-block">Fundamental Analysis</h3>
                    <p className="text-2xl font-black outfit mt-4 tracking-tight">Financial Health & Valuation</p>
                </div>
                <div className="flex gap-2">
                    <Tooltip text="Data sourced from quarterly filings" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-3 group cursor-help relative"
                        title={m.tip}
                    >
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                            <span className="p-1.5 bg-surface-alt rounded-lg">{m.icon}</span> {m.label}
                        </p>
                        <p className={`text-2xl font-black outfit ${m.color || 'text-white'}`}>{m.value}</p>
                        <div className="h-1 w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full"></div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-between p-8 bg-surface-alt/20 rounded-[32px] border border-white/5 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 xl:mb-0 relative z-10 w-full xl:w-auto">
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke={getValColor()}
                                strokeWidth="8"
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * (activeValuation === 'Cheap' ? 0.85 : activeValuation === 'Fair' ? 0.6 : 0.35)) }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-black text-sm outfit tracking-tighter" style={{ color: getValColor() }}>
                                {activeValuation === 'Cheap' ? 'UNDERVALUED' : activeValuation === 'Fair' ? 'FAIR VALUE' : 'OVERVALUED'}
                            </span>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-black outfit tracking-tight flex items-center justify-center md:justify-start gap-3">
                            Valuation Perspective <Target size={18} className="text-primary" />
                        </h4>
                        <p className="text-sm text-text-muted font-medium mt-2 max-w-md">Based on sector-wide average comparative analysis and discounted cash flow models.</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 relative z-10">
                    <ValuationBadge
                        label="Expensive"
                        active={activeValuation === 'Expensive'}
                        onClick={() => setActiveValuation('Expensive')}
                        color="text-sell"
                    />
                    <ValuationBadge
                        label="Fair"
                        active={activeValuation === 'Fair'}
                        onClick={() => setActiveValuation('Fair')}
                        color="text-primary"
                    />
                    <ValuationBadge
                        label="Cheap"
                        active={activeValuation === 'Cheap'}
                        onClick={() => setActiveValuation('Cheap')}
                        color="text-buy"
                    />
                </div>
            </div>
        </div>
    );
};

const ValuationBadge = ({ label, active, onClick, color }) => (
    <button
        onClick={onClick}
        className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-500 relative overflow-hidden group/btn ${active
            ? `bg-slate-900 border-primary text-white shadow-2xl shadow-primary/20 scale-105`
            : 'border-white/5 text-text-muted hover:border-white/20'
            }`}
    >
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
        <span className={active ? color : ''}>{label}</span>
    </button>
);

const Tooltip = ({ text }) => (
    <div className="group relative">
        <div className="p-2 bg-surface-alt rounded-lg text-text-muted hover:text-primary transition-colors cursor-pointer">
            <Info size={16} />
        </div>
        <div className="absolute bottom-full right-0 mb-3 w-48 p-3 bg-slate-900 text-[10px] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/10 shadow-2xl z-50">
            {text}
            <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 border-r border-b border-white/10 rotate-45 -translate-y-1"></div>
        </div>
    </div>
);

export default FundamentalPanel;
