
import React, { useState, useEffect } from 'react';
import { Newspaper, MessageCircle, ExternalLink, TrendingUp, TrendingDown, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SentimentModule = ({ stock }) => {
    const [newsVisible, setNewsVisible] = useState(false);

    useEffect(() => {
        setNewsVisible(true);
    }, []);

    const news = stock.news || [
        { title: "Tesla Q4 Earnings: Record Revenue Beats Expectations", sentiment: "Bullish", source: "Bloomberg", time: "2h ago" },
        { title: "NHTSA Issues New Safety Recall for Model 3 and Y", sentiment: "Bearish", source: "Reuters", time: "5h ago" },
        { title: "Institutional Investors Increase Stake in Tech Sector", sentiment: "Bullish", source: "Wall Street Journal", time: "8h ago" },
        { title: "Giga Nevada Expansion Greenlit by Local Authorities", sentiment: "Bullish", source: "Teslarati", time: "1d ago" },
    ];

    const score = stock.sentiment || 0.5;
    const rotation = score * 90;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Sentiment Gauge */}
            <div className="glass-panel p-8 flex flex-col items-center">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-12 self-start border-b border-border pb-2 w-full">Aggregated Sentiment</h3>

                <div className="relative w-64 h-32 flex items-center justify-center overflow-hidden mb-8">
                    {/* Gauge Track */}
                    <svg className="absolute bottom-0 w-64 h-32" viewBox="0 0 100 50">
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="10"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 10 50 A 40 40 0 0 1 50 10"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="10"
                            strokeLinecap="round"
                            className="opacity-20"
                        />
                        <path
                            d="M 50 10 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeLinecap="round"
                            className="opacity-40"
                        />
                    </svg>

                    {/* Needle */}
                    <motion.div
                        initial={{ rotate: -90 }}
                        animate={{ rotate: rotation }}
                        transition={{ type: "spring", damping: 12, stiffness: 60, delay: 0.5 }}
                        className="absolute bottom-0 left-1/2 w-1.5 h-28 bg-gradient-to-t from-primary to-accent origin-bottom -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-primary shadow-lg"></div>
                    </motion.div>

                    <div className="absolute bottom-0 w-10 h-10 bg-slate-900 rounded-full border-4 border-slate-800 z-20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="text-center">
                    <motion.p
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 }}
                        className={`text-4xl font-black outfit tracking-tighter ${score > 0 ? 'text-buy' : 'text-sell'}`}
                    >
                        {score > 0.5 ? 'VERY BULLISH' : score > 0 ? 'BULLISH' : 'BEARISH'}
                    </motion.p>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-3">Sentiment Index Score: <span className="text-white">+0.65</span></p>
                </div>

                <div className="mt-12 w-full space-y-5">
                    <SentimentIndicator label="News Sentiment" score={0.82} color="bg-buy" delay={1.2} />
                    <SentimentIndicator label="Reddit Activity" score={0.45} color="bg-primary" delay={1.4} />
                    <SentimentIndicator label="X/Twitter Buzz" score={0.71} color="bg-accent" delay={1.6} />
                </div>
            </div>

            {/* Right: Latest News List */}
            <div className="md:col-span-2 glass-panel p-8">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] border-b border-border pb-2">Institutional Intelligence</h3>
                        <p className="text-2xl font-black outfit mt-4 tracking-tight">Market Buzz & Headlines</p>
                    </div>
                    <button className="px-6 py-2 bg-surface-alt hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                        View Archive
                    </button>
                </div>

                <div className="space-y-4">
                    {news.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 20, opacity: 0 }}
                            animate={newsVisible ? { x: 0, opacity: 1 } : {}}
                            transition={{ delay: 0.2 * i }}
                            onClick={() => window.open('#', '_blank')}
                            className="flex items-start gap-6 p-5 bg-surface-alt/30 rounded-3xl border border-white/5 hover:border-primary/30 hover:bg-surface-alt/50 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform ${item.sentiment === 'Bullish' ? 'bg-buy/10 text-buy border border-buy/20' : 'bg-sell/10 text-sell border border-sell/20'}`}>
                                {item.sentiment === 'Bullish' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>

                            <div className="flex-1 space-y-2 relative z-10">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-black outfit leading-relaxed pr-10 group-hover:text-primary transition-colors">{item.title}</h4>
                                    <div className="p-2 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 shadow-xl">
                                        <ExternalLink size={14} className="text-primary" />
                                    </div>
                                </div>
                                <div className="flex gap-4 text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">
                                    <span className="flex items-center gap-1.5"><Newspaper size={10} /> {item.source}</span>
                                    <span>•</span>
                                    <span>{item.time}</span>
                                    <span className={`ml-auto flex items-center gap-1.5 ${item.sentiment === 'Bullish' ? 'text-buy' : 'text-sell'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.sentiment === 'Bullish' ? 'bg-buy animate-pulse' : 'bg-sell'}`}></div>
                                        {item.sentiment}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/20 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <MessageCircle size={18} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black outfit">Social Pulse Integration</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Connect Reddit & X accounts for custom alerts</p>
                        </div>
                    </div>
                    <MousePointer2 size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                </div>
            </div>
        </div>
    );
};

const SentimentIndicator = ({ label, score, color, delay }) => (
    <div className="space-y-3 w-full group">
        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-white transition-colors">
            <span>{label}</span>
            <span className="font-mono">{Math.round(score * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score * 100}%` }}
                transition={{ duration: 1.5, delay, ease: "easeOut" }}
                className={`h-full ${color} shadow-[0_0_10px_rgba(59,130,246,0.3)] relative`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            </motion.div>
        </div>
    </div>
);

export default SentimentModule;
