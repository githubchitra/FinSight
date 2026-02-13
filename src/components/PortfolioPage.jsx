
import React, { useState, useEffect } from 'react';
import { Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Plus, Minus, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { fetchPortfolioData } from '../services/api';

const PortfolioPage = () => {
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [riskValue, setRiskValue] = useState(65);
    const [balance, setBalance] = useState({ total: 100000, pnl: 0, power: 100000 });

    useEffect(() => {
        const loadData = async () => {
            const { paperTrader } = await import('../services/tradingEngine');
            const stats = paperTrader.getStats();
            const positions = paperTrader.getPositionsWithPnL({});

            setHoldings(positions);
            setBalance({
                total: stats.equity,
                pnl: positions.reduce((acc, p) => acc + p.unrealizedPnL, 0),
                power: stats.balance
            });
            setLoading(false);
        };
        loadData();
    }, []);

    const handleTrade = async (type, symbol) => {
        const { paperTrader } = await import('../services/tradingEngine');
        try {
            if (type === 'plus') {
                // Mock one additional share for simulation
                paperTrader.buy(symbol, 1, holdings.find(h => h.ticker === symbol).currentPrice);
            } else {
                paperTrader.sell(symbol, 1, holdings.find(h => h.ticker === symbol).currentPrice);
            }
            window.location.reload(); // Quick refresh to update state
        } catch (e) {
            alert(e.message);
        }
    };

    const sectorData = [
        { name: 'Technology', value: 42, color: '#3b82f6' },
        { name: 'Consumer Cyclical', value: 28, color: '#10b981' },
        { name: 'Finance', value: 18, color: '#f59e0b' },
        { name: 'Others', value: 12, color: '#64748b' },
    ];

    const getRiskLabel = (val) => {
        if (val < 33) return 'Conservative';
        if (val < 66) return 'Balanced';
        return 'Aggressive';
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black outfit tracking-tight">Virtual Portfolio</h2>
                    <p className="text-text-muted text-sm font-medium">Real-time simulator and asset tracking</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn bg-surface-alt hover:bg-slate-700 text-xs font-black uppercase tracking-widest px-6">
                        <Wallet size={16} /> Fund Account
                    </button>
                    <button className="btn btn-primary font-black uppercase tracking-widest px-6 shadow-xl shadow-primary/20">
                        <Plus size={18} /> New Trade
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PortfolioStat label="Total Balance" value={`$${balance.total.toLocaleString()}`} change="+12.4%" positive={true} />
                        <PortfolioStat label="Unrealized P/L" value={`+$${balance.pnl.toLocaleString()}`} change="+8.2%" positive={true} />
                        <PortfolioStat label="Buying Power" value={`$${balance.power.toLocaleString()}`} sub="Cash in USD" />
                    </div>

                    <div className="glass-panel overflow-hidden">
                        <div className="p-8 border-b border-border flex justify-between items-center">
                            <h3 className="font-black outfit text-xl">Active Holdings</h3>
                            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Rebalance Portfolio</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-alt/50 text-text-muted text-[10px] uppercase font-black tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Asset</th>
                                        <th className="px-8 py-5">Quantity</th>
                                        <th className="px-8 py-5">Avg Price</th>
                                        <th className="px-8 py-5">Market Price</th>
                                        <th className="px-8 py-5 text-right">Profit/Loss</th>
                                        <th className="px-8 py-5">Allocation</th>
                                        <th className="px-8 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {loading ? [...Array(4)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(7)].map((_, j) => <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-800 rounded-lg w-full"></div></td>)}
                                        </tr>
                                    )) : holdings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-8 py-20 text-center text-text-muted font-bold uppercase tracking-widest opacity-50">No active positions</td>
                                        </tr>
                                    ) : holdings.map((holding, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs border border-white/5 shadow-lg shadow-black/20">{holding.ticker}</div>
                                                    <div>
                                                        <p className="font-black outfit text-sm">{holding.ticker}</p>
                                                        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Asset</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold">{holding.qty}</td>
                                            <td className="px-8 py-6 text-text-muted font-bold font-mono">${holding.avgPrice.toFixed(2)}</td>
                                            <td className="px-8 py-6 font-black outfit text-lg">${holding.currentPrice.toFixed(2)}</td>
                                            <td className={`px-8 py-6 font-black text-right text-lg outfit ${holding.unrealizedPnL >= 0 ? 'text-buy' : 'text-sell'}`}>
                                                {holding.unrealizedPnL >= 0 ? '+' : ''}${holding.unrealizedPnL.toFixed(2)}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ width: '25%' }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black">25%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => handleTrade('plus', holding.ticker)}
                                                        className="w-8 h-8 flex items-center justify-center bg-buy/10 text-buy rounded-lg hover:bg-buy/20 transition-all border border-buy/20"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleTrade('minus', holding.ticker)}
                                                        className="w-8 h-8 flex items-center justify-center bg-sell/10 text-sell rounded-lg hover:bg-sell/20 transition-all border border-sell/20"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Trade History - Realized PnL tracking */}
                    <div className="glass-panel overflow-hidden">
                        <div className="p-8 border-b border-border">
                            <h3 className="font-black outfit text-xl">Execution History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-alt/50 text-text-muted text-[10px] uppercase font-black tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Ticker</th>
                                        <th className="px-8 py-5">Type</th>
                                        <th className="px-8 py-5 text-right">Price</th>
                                        <th className="px-8 py-5 text-right">Realized P/L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {(window.localStorage.getItem('finbot_trade_profile') ? JSON.parse(window.localStorage.getItem('finbot_trade_profile')).history : []).reverse().map((trade, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6 text-text-muted font-bold text-xs">{new Date(trade.date).toLocaleDateString()}</td>
                                            <td className="px-8 py-6 font-black outfit">{trade.ticker}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black border ${trade.type === 'BUY' ? 'bg-buy/10 text-buy border-buy/20' : 'bg-sell/10 text-sell border-sell/20'}`}>
                                                    {trade.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold outfit">${trade.price.toFixed(2)}</td>
                                            <td className={`px-8 py-6 text-right font-black outfit ${trade.pnl >= 0 ? 'text-buy' : trade.pnl < 0 ? 'text-sell' : 'text-text-muted'}`}>
                                                {trade.pnl !== undefined ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel p-8">
                        <h3 className="font-black outfit text-xl mb-8 flex items-center gap-3">
                            <PieIcon size={20} className="text-primary" /> Sector Allocation
                        </h3>
                        <div className="w-full h-56 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sectorData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {sectorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black outfit tracking-tighter">42%</span>
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Tech</span>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            {sectorData.map((s, i) => (
                                <LegendItem key={i} color={s.color} label={s.name} value={`${s.value}%`} />
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-8 bg-gradient-to-br from-slate-900 to-primary/10 border-primary/20">
                        <h3 className="font-black outfit text-xl mb-6">Risk Profile</h3>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Profile Level</span>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${riskValue > 66 ? 'text-sell border-sell/30 bg-sell/10' : 'text-buy border-buy/30 bg-buy/10'}`}>
                                {getRiskLabel(riskValue)}
                            </span>
                        </div>
                        <div className="space-y-6">
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={riskValue}
                                onChange={(e) => setRiskValue(e.target.value)}
                                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="p-4 bg-background/50 rounded-2xl border border-white/5 space-y-3">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={12} className="text-primary" /> Recommendation
                                </p>
                                <p className="text-xs text-text-muted leading-relaxed font-semibold italic">
                                    {riskValue > 66 ?
                                        "Strategy: Aggressive growth. Increase exposure to high-beta semiconductor stocks for maximum upside." :
                                        riskValue < 33 ?
                                            "Strategy: Wealth preservation. Rotate capital into low-volatility commodities and defensive treasury bonds." :
                                            "Strategy: Balanced stability. Maintain current 60/40 tech-to-defensive allocation for sustainable yields."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PortfolioStat = ({ label, value, change, positive, sub }) => (
    <div className="glass-panel p-8 border-b-4 border-b-transparent hover:border-b-primary transition-all group">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 group-hover:text-primary transition-colors">{label}</p>
        <div className="flex items-end gap-3">
            <p className="text-3xl font-black outfit tracking-tighter">{value}</p>
            {change && (
                <span className={`flex items-center text-xs font-black mb-1.5 px-2 py-0.5 rounded-lg ${positive ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'}`}>
                    {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}
                </span>
            )}
        </div>
        {sub && <p className="text-[10px] text-text-muted mt-3 uppercase font-black tracking-widest opacity-60">{sub}</p>}
    </div>
);

const LegendItem = ({ color, label, value }) => (
    <div className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
        <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">{label}</span>
        </div>
        <span className="text-xs font-black outfit">{value}</span>
    </div>
);

export default PortfolioPage;
