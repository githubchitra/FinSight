
import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, ShieldAlert, Zap, Table as TableIcon, Loader2 } from 'lucide-react';
import { fetchBacktestResults } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const BacktestingPage = ({ stock }) => {
    const [strategy, setStrategy] = useState('SMA Crossover');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('All');

    const runSimulation = async () => {
        setLoading(true);
        const data = await fetchBacktestResults(stock.ticker, strategy);
        setResults(data);
        setLoading(false);
    };

    useEffect(() => {
        runSimulation();
    }, [strategy, stock.ticker]);

    const filteredTrades = results?.trades.filter(t => filter === 'All' || t.status === filter) || [];

    // Equity Curve Data from results
    const equityData = results?.equityCurve || [];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black outfit tracking-tight">Backtest Engine</h2>
                    <p className="text-text-muted text-sm font-medium">Historical performance simulation for {stock.ticker}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-border">
                        <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Strategy</span>
                        <select
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="SMA Crossover">SMA Crossover</option>
                            <option value="RSI Mean Reversion">RSI Mean Reversion</option>
                            <option value="MACD Momentum">MACD Momentum</option>
                        </select>
                    </div>
                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className="btn btn-primary font-bold px-6 flex items-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="white" />}
                        {loading ? 'Simulating...' : 'Run Simulation'}
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {!results ? [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-800/50 rounded-3xl animate-pulse"></div>) :
                    results.stats.map((s, i) => (
                        <ResultCard key={i} {...s} />
                    ))
                }
            </div>

            {/* Equity Curve */}
            <div className="glass-panel p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="font-black outfit text-xl">Equity Curve</h3>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Strategy Performance vs Benchmark</p>
                    </div>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div> Strategy</span>
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-600"></div> Benchmark</span>
                    </div>
                </div>

                <div className="w-full h-80">
                    {loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 border border-dashed border-slate-700/50 rounded-3xl">
                            <div className="flex gap-1 animate-pulse">
                                {[...Array(8)].map((_, i) => <div key={i} className="w-2 h-16 bg-primary/20 rounded-full" style={{ height: `${20 + Math.random() * 60}%` }}></div>)}
                            </div>
                            <p className="text-[10px] font-black text-text-muted tracking-[0.3em] uppercase">Calculating Historical Vectors...</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={equityData}>
                                <defs>
                                    <linearGradient id="colorStrat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="strategy" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStrat)" />
                                <Area type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Trades Table */}
            <div className="glass-panel overflow-hidden">
                <div className="p-8 border-b border-border flex justify-between items-center">
                    <div>
                        <h3 className="font-black outfit text-xl flex items-center gap-3">
                            <TableIcon size={20} className="text-primary" /> Execution History
                        </h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Detailed Log of Strategy Trades</p>
                    </div>
                    <div className="flex bg-surface-alt p-1 rounded-xl border border-white/5">
                        {['All', 'Win', 'Loss'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-alt/50 text-text-muted uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Entry</th>
                                <th className="px-8 py-5">Exit</th>
                                <th className="px-8 py-5 text-right">Return</th>
                                <th className="px-8 py-5 text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? [...Array(4)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[...Array(6)].map((_, j) => <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-800 rounded-lg w-full"></div></td>)}
                                </tr>
                            )) : filteredTrades.map((trade, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6 font-bold outfit">{trade.date}</td>
                                    <td className="px-8 py-6">
                                        <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black border border-white/5">{trade.type}</span>
                                    </td>
                                    <td className="px-8 py-6 font-mono font-bold text-slate-400">{trade.entry}</td>
                                    <td className="px-8 py-6 font-mono font-bold text-slate-400">{trade.exit}</td>
                                    <td className={`px-8 py-6 font-black text-right text-lg outfit ${trade.status === 'Win' ? 'text-buy' : 'text-sell'}`}>{trade.pnl}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trade.status === 'Win' ? 'bg-buy/10 text-buy border border-buy/20' : 'bg-sell/10 text-sell border border-sell/20'}`}>
                                                {trade.status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ResultCard = ({ label, value, sub, color }) => (
    <div className="glass-panel p-6 border-b-4 border-b-transparent hover:border-b-primary transition-all group">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors">{label}</p>
        <p className={`text-3xl font-black outfit ${color}`}>{value}</p>
        <p className="text-[10px] mt-3 text-text-muted font-bold uppercase tracking-widest">{sub}</p>
    </div>
);

export default BacktestingPage;
