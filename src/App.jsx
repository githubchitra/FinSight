import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    BarChart3,
    History,
    Wallet,
    Lightbulb,
    MessageSquare,
    Search,
    Bell,
    User,
    TrendingUp,
    Menu,
    X,
    Activity,
    Zap,
    Cpu,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import PriceChart from './components/PriceChart';
import BacktestingPage from './components/BacktestingPage';
import PortfolioPage from './components/PortfolioPage';
import SentimentModule from './components/SentimentModule';
import FundamentalPanel from './components/FundamentalPanel';
import Info from './components/Info';
import { fetchStockData } from './services/api';
import { paperTrader } from './services/tradingEngine';

// Mock Data
const MOCK_STOCK = {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.42,
    change: 4.82,
    changePercent: 1.98,
    volume: '112.4M',
    marketCap: '782.1B',
    pe: '42.1',
    sentiment: 0.65, // -1 to 1
    indicators: [
        { name: 'RSI', value: '45.2', signal: 'Neutral' },
        { name: 'MACD', value: 'Positive Crossover', signal: 'Buy' },
        { name: 'SMA 50/200', value: 'Bullish Crossover', signal: 'Buy' }
    ],
    strategies: [
        { name: 'MA Crossover', signal: 'BUY', explanation: 'Golden cross observed on 50/200 SMA.', date: '2026-02-10' },
        { name: 'RSI Strategy', signal: 'HOLD', explanation: 'RSI is at 45, indicating neither overbought nor oversold.', date: '2026-02-12' },
        { name: 'Combined', signal: 'BUY', explanation: 'Technical signals align with positive social sentiment.', date: '2026-02-12' }
    ],
    fundamentals: {
        pe: '42.1',
        eps: '4.52',
        revenue: '$96.7B',
        growth: '+18.5%',
        valuation: 'Fair'
    }
};

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('TSLA');
    const [stock, setStock] = useState(MOCK_STOCK);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        const updateStock = async () => {
            const data = await fetchStockData(searchQuery || 'TSLA');
            setStock(data);
        };
        const timer = setTimeout(updateStock, 500); // Debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Update prices every 30 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            const data = await fetchStockData(stock.ticker);
            setStock(data);
        }, 30000);
        return () => clearInterval(interval);
    }, [stock.ticker]);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analysis', label: 'Stock Analysis', icon: BarChart3 },
        { id: 'backtesting', label: 'Backtesting', icon: History },
        { id: 'portfolio', label: 'Portfolio', icon: Wallet },
        { id: 'learn', label: 'Learn', icon: Lightbulb },
        { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard stock={stock} />;
            case 'analysis':
                return <AnalysisPage stock={stock} />;
            case 'backtesting':
                return <BacktestingPage stock={stock} />;
            case 'portfolio':
                return <PortfolioPage />;
            case 'learn':
                return <LearnPage />;
            case 'chat':
                return <ChatPage stock={stock} />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <h2 className="text-2xl text-text-muted">Module {activeTab} coming soon...</h2>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="glass-panel m-4 mr-0 flex flex-col py-8 transition-all duration-300 z-50 backdrop-blur-xl"
            >
                <div className="mb-12 flex items-center gap-3 px-6 w-full">
                    <div className="bg-primary p-2 rounded-lg shrink-0 shadow-lg shadow-primary/30">
                        <TrendingUp size={24} color="white" />
                    </div>
                    {isSidebarOpen && <h1 className="text-2xl font-bold tracking-tight outfit bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FinBot</h1>}
                </div>

                <nav className="flex-1 w-full px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                : 'text-text-muted hover:bg-surface-alt hover:text-text'
                                }`}
                        >
                            <item.icon size={22} className="shrink-0" />
                            {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="px-4 mt-auto">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-surface-alt text-text-muted rounded-xl transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        {isSidebarOpen && <span className="font-medium">Collapse</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 py-4 shrink-0">
                    <div className="relative w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search ticker (e.g. TSLA, NVDA)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                            className="w-full bg-surface-alt border border-border rounded-xl py-2.5 pl-10 pr-4 text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfile(false);
                                }}
                                className="relative text-text-muted hover:text-text transition-all hover:scale-110 bg-transparent border-none cursor-pointer p-1"
                            >
                                <Bell size={22} strokeWidth={2.5} />
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-50 rounded-full border-2 border-background"></span>
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-80 glass-panel p-4 z-[100] border-white/10"
                                    >
                                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                            <h4 className="text-xs font-black uppercase tracking-widest">Notifications</h4>
                                            <span className="text-[10px] text-primary cursor-pointer hover:underline">Mark all as read</span>
                                        </div>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {[
                                                { title: 'Volatility Alert', desc: 'TSLA has moved 4.2% in the last hour.', time: '12m ago', type: 'warning' },
                                                { title: 'Trade Executed', desc: 'Successfully bought 10 shares of NVDA.', time: '2h ago', type: 'success' },
                                                { title: 'New Signal', desc: 'Golden Cross detected for AAPL.', time: '5h ago', type: 'info' }
                                            ].map((n, i) => (
                                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-[11px] font-bold group-hover:text-primary">{n.title}</p>
                                                        <span className="text-[9px] text-slate-500">{n.time}</span>
                                                    </div>
                                                    <p className="text-[10px] text-text-muted leading-relaxed">{n.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-4 py-2 bg-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">View All Hub</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <div
                                onClick={() => {
                                    setShowProfile(!showProfile);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center gap-3 bg-surface-alt py-1.5 px-3 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                                    <User size={18} color="white" strokeWidth={3} />
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-bold outfit">Chitra</p>
                                    <p className="text-[10px] text-text-muted font-black tracking-widest uppercase">Pro Account</p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-56 glass-panel p-2 z-[100] border-white/10"
                                    >
                                        <div className="p-2 mb-2 border-b border-white/5">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">System Settings</p>
                                        </div>
                                        <button className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-xs font-medium transition-colors">
                                            <User size={14} className="text-primary" /> Profile Settings
                                        </button>
                                        <button className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-xs font-medium transition-colors">
                                            <Wallet size={14} className="text-buy" /> Subscription
                                        </button>
                                        <button className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-xs font-medium transition-colors">
                                            <Zap size={14} className="text-hold" /> API Keys
                                        </button>
                                        <div className="h-[1px] bg-white/5 my-2"></div>
                                        <button className="w-full flex items-center gap-3 p-2 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-medium transition-colors">
                                            <X size={14} /> Log Out Account
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// --- Sub-Components (Dashboard) ---

const Dashboard = ({ stock }) => (
    <div className="space-y-8 pb-10">
        {/* Risk Disclaimer */}
        <RiskDisclaimer />

        {/* ROW 1: Stock Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
            <StatCard label="Current Price" value={`$${stock.price}`} subValue={`${stock.changePercent}%`} subColor={stock.changePercent > 0 ? "text-buy" : "text-sell"} icon={<Activity size={12} />} />
            <StatCard label="Today Change" value={`${stock.change}`} subColor={stock.change > 0 ? "text-buy" : "text-sell"} />
            <StatCard label="Volume" value={stock.volume} subValue="24h Activity" />
            <StatCard label="Market Cap" value={stock.marketCap} />
            <StatCard label="P/E Ratio" value={stock.pe} />
            <StatCard label="Quant Score" value={stock.strategies[0].signal} subValue={`Score: ${(stock.sentiment * 10).toFixed(1)}`} subColor={stock.sentiment > 0 ? "text-buy" : "text-sell"} />
        </div>

        {/* ROW 2: Main Price Chart & Trading Terminal */}
        <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 glass-panel p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl border border-border">{stock.ticker}</div>
                        <div>
                            <h2 className="text-xl font-bold outfit">{stock.name}</h2>
                            <p className="text-xs text-text-muted flex items-center gap-1"><span className="w-1.5 h-1.5 bg-buy rounded-full shadow-[0_0_5px_rgba(16,185,129,1)]"></span> Live Market Analysis</p>
                        </div>
                    </div>
                    <div className="flex gap-2 bg-surface-alt p-1 rounded-xl">
                        {['1D', '1W', '1M', '1Y', 'ALL'].map(t => (
                            <button key={t} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${t === '1M' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}>{t}</button>
                        ))}
                    </div>
                </div>
                <div className="w-full h-[400px]">
                    <PriceChart ticker={stock.ticker} />
                </div>
            </div>

            <div className="w-full xl:w-80 glass-panel p-6 flex flex-col">
                <TradingWidget stock={stock} />
                <PositionSizer price={stock.price} />
            </div>
        </div>

        {/* ROW 3: Indicators Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IndicatorMiniChart label="RSI (14)" value={stock.indicators[0].value} signal={stock.indicators[0].signal} type="rsi" />
            <IndicatorMiniChart label="MACD Histogram" value={stock.indicators[1].value} signal={stock.indicators[1].signal} type="macd" />
            <IndicatorMiniChart label="SMA Trend" value={stock.indicators[2].value} signal={stock.indicators[2].signal} type="volume" />
        </div>

        {/* ROW 4: Strategy Signals Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StrategyCard strategy={stock.strategies[0]} />
            <div className="glass-panel p-6 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Cpu size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-sm tracking-tight outfit uppercase mb-2">Signal Logic</h4>
                    <p className="text-xs text-text-muted leading-relaxed">Generated using a multi-layer quant engine: EMA 12/26 crossovers confirmed by RSI strength and volume delta. Not financial advice.</p>
                </div>
            </div>
        </div>

        {/* ROW 5: Sentiment Dashboard */}
        <SentimentModule stock={stock} />

        {/* ROW 6: Fundamentals Panel */}
        <FundamentalPanel stock={stock} />

        {/* ROW 7: Final AI Recommendation Panel */}
        <div className="glass-panel p-10 bg-gradient-to-br from-primary/20 via-background to-accent/20 border-primary/30 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700"></div>
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                <div className="text-center lg:text-left shrink-0">
                    <p className="text-text-muted font-black mb-3 uppercase tracking-[0.3em] text-[10px]">Aggregated Decision</p>
                    <h2 className={`text-7xl font-black outfit mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] ${stock.strategies[0].signal === 'BUY' ? 'text-buy' : stock.strategies[0].signal === 'SELL' ? 'text-sell' : 'text-hold'}`}>{stock.strategies[0].signal}</h2>
                    <div className="inline-flex items-center gap-4 bg-surface-alt/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                        <span className="font-black text-primary text-2xl">{Math.abs(stock.sentiment * 100).toFixed(0)}%</span>
                        <div className="w-32 h-2.5 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.abs(stock.sentiment * 100)}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                            ></motion.div>
                        </div>
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Confidence</span>
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Cpu size={16} className="text-primary" /> Multi-Layer Logical Confirmation
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InsightItem text={`${stock.strategies[0].explanation}`} />
                        <InsightItem text={`RSI is currently at ${stock.indicators[0].value}, indicating ${stock.indicators[0].signal} momentum.`} />
                        <InsightItem text={`MACD histogram is ${parseFloat(stock.indicators[1].value) > 0 ? 'positive' : 'negative'} showing ${stock.indicators[1].signal} pressure.`} />
                        <InsightItem text={`Price is ${parseFloat(stock.price) > parseFloat(stock.indicators[2].value) ? 'above' : 'below'} SMA 50, suggesting a ${parseFloat(stock.price) > parseFloat(stock.indicators[2].value) ? 'bullish' : 'bearish'} trend.`} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Sub-Components (Utilities) ---

const StatCard = ({ label, value, subValue, subColor = "text-text-muted", icon }) => (
    <div className="glass-card p-6 border-b-4 border-b-transparent hover:border-b-primary transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</p>
            {icon && <span className={subColor}>{icon}</span>}
        </div>
        <p className="text-2xl font-black outfit mb-1">{value}</p>
        {subValue && <p className={`text-[10px] font-bold ${subColor} uppercase tracking-tight`}>{subValue}</p>}
    </div>
);

const IndicatorMiniChart = ({ label, value, signal, type }) => (
    <div className="glass-panel p-6 hover:bg-surface-alt/40 transition-colors cursor-pointer group">
        <div className="flex justify-between items-start mb-6">
            <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-bold outfit">{value}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${signal === 'Buy' || signal === 'Accumulating' ? 'bg-buy/20 text-buy' : 'bg-hold/20 text-hold'}`}>{signal}</span>
        </div>
        <div className="h-16 flex items-end gap-1 px-1">
            {[...Array(12)].map((_, i) => {
                const height = Math.random() * 80 + 20;
                return (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex-1 rounded-t-sm ${type === 'rsi' ? 'bg-primary/30' : type === 'macd' ? 'bg-accent/30' : 'bg-buy/30'} group-hover:opacity-100 transition-opacity`}
                    ></motion.div>
                )
            })}
        </div>
    </div>
);

const StrategyCard = ({ strategy }) => (
    <div className="glass-card p-6 border-t-4 border-t-primary hover:translate-y-[-4px] transition-all group">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm tracking-tight outfit group-hover:text-primary transition-colors">{strategy.name}</h3>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${strategy.signal === 'BUY' ? 'bg-buy/20 text-buy shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-hold/20 text-hold'}`}>{strategy.signal}</span>
        </div>
        <p className="text-xs text-text-muted mb-8 leading-relaxed italic line-clamp-2">{strategy.explanation}</p>
        <div className="flex items-center justify-between pt-6 border-t border-border/30">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{strategy.date}</span>
            <button className="text-[10px] text-primary font-black uppercase tracking-[0.2em] hover:text-white transition-colors">EXPLORE</button>
        </div>
    </div>
);

const InsightItem = ({ text }) => (
    <div className="flex items-start gap-4 p-4 bg-surface-alt/40 rounded-2xl border border-white/5 hover:bg-surface-alt transition-colors group">
        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)] group-hover:scale-150 transition-transform"></div>
        <p className="text-xs text-text-muted leading-relaxed font-medium">{text}</p>
    </div>
);

// --- Page Components ---

const AnalysisPage = ({ stock }) => (
    <div className="space-y-8 h-full flex flex-col">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-4xl font-black outfit tracking-tight">Technical Engine</h2>
                <p className="text-text-muted text-sm font-medium">Precision analysis tools for {stock.name}</p>
            </div>
            <div className="flex gap-3">
                <button className="btn bg-surface-alt text-[10px] font-black uppercase tracking-[0.2em] px-6">Add Overlay</button>
                <button className="btn btn-primary text-[10px] font-black uppercase tracking-[0.2em] px-6">Export Insights</button>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
            <div className="lg:col-span-3 glass-panel p-8 flex flex-col group">
                <div className="flex-1 w-full bg-slate-900/60 rounded-3xl border border-dashed border-slate-700/50 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-primary/50">
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
                    <div className="text-center z-10 px-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="mb-8 opacity-20"
                        >
                            <Cpu size={80} className="text-primary mx-auto" />
                        </motion.div>
                        <h3 className="text-xl font-black outfit mb-2 tracking-widest uppercase">Rendering High Precision Charts</h3>
                        <p className="text-slate-500 font-bold tracking-[0.3em] text-[10px] max-w-sm mx-auto">PROCESSING LIVE DATASTREAMS FROM GLOBAL EXCHANGES</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-surface-alt/50 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Volume Delta</p>
                        <div className="flex items-end gap-1.5 h-16">
                            {[4, 9, 3, 11, 7, 14, 6, 12].map((h, i) => <div key={i} className="flex-1 bg-primary/20 rounded-full" style={{ height: `${h * 7}%` }}></div>)}
                        </div>
                    </div>
                    <div className="bg-surface-alt/50 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Volatility Index</p>
                        <div className="text-center py-2">
                            <p className="text-3xl font-black outfit text-hold">18.4%</p>
                            <p className="text-[9px] font-black text-buy uppercase mt-1 tracking-widest">Normal Range</p>
                        </div>
                    </div>
                    <div className={`md:col-span-2 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl p-5 border border-white/5 flex items-center justify-between`}>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Algorithmic Bias</p>
                            <p className="text-xl font-bold outfit">Institutional Accumulation</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center">
                            <TrendingUp size={20} className="text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] font-black mb-8 flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                    <Zap size={14} className="text-yellow-400" /> Scanner Alerts
                </h3>
                <div className="space-y-4">
                    {[
                        { title: 'RSI Divergence', desc: 'Bullish divergence on 1H', time: '12m ago', level: 'High' },
                        { title: 'MA Crossover', desc: '50 SMA crossed 200 SMA', time: '4h ago', level: 'Critical' },
                        { title: 'Volume Spike', desc: '300% above average', time: '6h ago', level: 'Med' },
                        { title: 'Support Break', desc: 'Level $242.00 tested', time: '1d ago', level: 'Low' },
                        { title: 'ADX Trend', desc: 'Strength increasing to 32', time: '2d ago', level: 'Med' },
                    ].map((alert, i) => (
                        <div key={i} className="p-5 bg-surface-alt/50 rounded-2xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="text-xs font-black outfit group-hover:text-primary transition-colors">{alert.title}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${alert.level === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>{alert.level}</span>
                            </div>
                            <p className="text-[10px] text-text-muted mb-4 leading-relaxed font-medium">{alert.desc}</p>
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{alert.time}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const LearnPage = () => {
    const [mode, setMode] = useState('beginner');

    return (
        <div className="space-y-10 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black outfit tracking-tighter mb-2">FinAcademy</h2>
                    <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px]">Your path to financial mastery starts here.</p>
                </div>
                <div className="flex bg-surface-alt p-1.5 rounded-2xl border border-border">
                    <button
                        onClick={() => setMode('beginner')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'beginner' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text'}`}
                    >Beginner</button>
                    <button
                        onClick={() => setMode('technical')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'technical' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-text'}`}
                    >Technical</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <LearnCard
                    title="Technical Analysis"
                    count="12 MODULES"
                    icon={<TrendingUp className="text-primary" />}
                    desc="Master chart patterns, technical indicators, and momentum oscillators."
                    color="border-t-primary"
                />
                <LearnCard
                    title="Fundamentals"
                    count="8 MODULES"
                    icon={<Cpu className="text-accent" />}
                    desc="Deep dive into balance sheets, cash flow, and intrinsic valuation models."
                    color="border-t-accent"
                />
                <LearnCard
                    title="Risk Strategy"
                    count="5 MODULES"
                    icon={<ShieldAlert className="text-secondary" />}
                    desc="Learn position sizing, stop-loss placement, and emotional discipline."
                    color="border-t-secondary"
                />
            </div>

            <div className="glass-panel p-10 bg-gradient-to-br from-slate-900 to-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Lightbulb size={200} />
                </div>
                <div className="flex flex-col xl:flex-row gap-16 items-center relative z-10">
                    <div className="flex-1 space-y-8">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Featured Lesson</div>
                        <h3 className="text-4xl font-black outfit">The Power of RSI</h3>
                        <p className="text-text-muted leading-relaxed font-medium">
                            The **Relative Strength Index (RSI)** is a momentum powerhouse. It measures the magnitude of recent price changes to evaluate whether a stock is being excessively bought or dumped.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-surface-alt/50 rounded-3xl border border-white/5 backdrop-blur-md">
                                <p className="text-[10px] font-black text-buy mb-3 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-buy"></span> Oversold (30)</p>
                                <p className="text-xs text-text-muted leading-relaxed">Buyers are exhausted, price is historically low. **Potential accumulation zone.**</p>
                            </div>
                            <div className="p-6 bg-surface-alt/50 rounded-3xl border border-white/5 backdrop-blur-md">
                                <p className="text-[10px] font-black text-sell mb-3 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sell"></span> Overbought (70)</p>
                                <p className="text-xs text-text-muted leading-relaxed">Sellers are rare, price is overstretched. **Potential distribution zone.**</p>
                            </div>
                        </div>

                        <button className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30">Start Module</button>
                    </div>
                    <div className="w-full xl:w-[450px] aspect-video bg-background/80 rounded-3xl border border-border shadow-2xl flex flex-col p-6 group">
                        <div className="flex-1 flex items-end gap-2 px-4 pb-8">
                            {[40, 65, 30, 55, 80, 45, 60, 35, 90, 70].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/20 rounded-full border border-primary/10 relative overflow-hidden group-hover:border-primary/30 transition-all">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.1, duration: 1 }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-accent opacity-50"
                                    ></motion.div>
                                </div>
                            ))}
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full mt-4 flex items-center justify-between px-2 text-[9px] font-black text-slate-500 tracking-widest">
                            <span>HISTORICAL AVG</span>
                            <div className="w-full mx-4 h-[1px] bg-slate-700/50"></div>
                            <span>LIVE TARGET</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const LearnCard = ({ title, count, icon, desc, color }) => (
    <div className={`glass-panel p-8 hover:border-primary/50 transition-all cursor-pointer group border-t-8 ${color}`}>
        <div className="w-16 h-16 rounded-2xl bg-surface-alt mb-8 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-black outfit group-hover:text-primary transition-colors">{title}</h4>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{count}</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed font-medium">{desc}</p>
    </div>
);

const ChatPage = ({ stock }) => {
    const [messages, setMessages] = useState([
        { type: 'bot', text: `Hello Chitra! I'm currently monitoring **${stock.ticker}** for you. Based on the latest data, the stock is showing strong bullish momentum after breaking through the resistance at $245. How can I assist you with your strategy today?`, time: '10:42 PM' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [liveIndicators, setLiveIndicators] = useState([
        { l: 'RSI', v: '45.2', s: 'NEU' },
        { l: 'MACD', v: 'POS', s: 'BUY' },
        { l: 'SMA', v: 'BULL', s: 'BUY' },
        { l: 'FLOW', v: 'HIGH', s: 'ACC' }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveIndicators(prev => prev.map(ind => ({
                ...ind,
                v: ind.l === 'RSI' ? (Math.random() * 20 + 35).toFixed(1) : ind.v
            })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMsg = {
            type: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Real context-aware bot response
        setTimeout(() => {
            const lowText = inputValue.toLowerCase();
            let botResponse = `Analyzing **${stock.ticker}** for you... \n\n`;
            let knowledgeCard = null;

            if (lowText.includes('rsi')) {
                const rsiVal = parseFloat(stock.indicators[0].value);
                botResponse += `The **Relative Strength Index (RSI)** for ${stock.ticker} is currently **${rsiVal}**. \n\n`;
                if (rsiVal < 35) {
                    botResponse += `This indicates an **oversold** condition, suggesting that selling pressure might be exhausted and a reversal could be imminent.`;
                } else if (rsiVal > 65) {
                    botResponse += `This indicates an **overbought** condition, suggesting that the price might be overextended and a pullback or consolidation is likely.`;
                } else {
                    botResponse += `The RSI is in a neutral zone, showing stable momentum.`;
                }
                knowledgeCard = {
                    title: "RSI (Relative Strength Index)",
                    formula: "100 - (100 / (1 + RS))",
                    thresholds: "35 (Oversold), 65 (Overbought)",
                    usage: "A momentum oscillator that measures the speed and change of price movements to identify overbought or oversold conditions."
                };
            } else if (lowText.includes('macd')) {
                const macdVal = stock.indicators[1].value;
                botResponse += `The **MACD Histogram** for ${stock.ticker} is currently **${macdVal}**. \n\n`;
                botResponse += `A positive histogram suggests bullish momentum (MACD Line above Signal Line), while a negative one suggests bearish momentum. Currently, the setup is showing **${stock.indicators[1].signal}** pressure.`;
                knowledgeCard = {
                    title: "MACD Momentum",
                    formula: "12 EMA - 26 EMA",
                    thresholds: "Signal Line Cross / Centerline Cross",
                    usage: "A trend-following momentum indicator that shows the relationship between two moving averages of an asset's price."
                };
            } else if (lowText.includes('signal') || lowText.includes('why')) {
                botResponse += `The current Quantitative Signal is **${stock.strategies[0].signal}**. \n\n`;
                botResponse += `This recommendation is based on the following logic path: \n`;
                stock.strategies[0].fullReasons.forEach(r => {
                    botResponse += `• ${r} \n`;
                });
                botResponse += `\nConfidence is currently at ${Math.abs(stock.sentiment * 100).toFixed(0)}%.`;
            } else if (lowText.includes('risk')) {
                const stopLoss = (stock.price * 0.95).toFixed(2);
                botResponse += `Risk management is the key to longevity in trading. For **${stock.ticker}**, if you were to enter at $${stock.price}: \n\n`;
                botResponse += `1. **Stop Loss**: A standard 5% stop would be at **$${stopLoss}**. \n`;
                botResponse += `2. **Position Sizing**: Based on your risk profile, use the Position Sizer to ensure you don't risk more than 1-2% of your virtual equity on this single trade. \n`;
                botResponse += `3. **Diversification**: Avoid over-concentrating in ${stock.ticker} even if the signal is strong.`;
            } else if (lowText.includes('sma') || lowText.includes('trend')) {
                botResponse += `The **50-day Simple Moving Average (SMA)** for ${stock.ticker} is at **${stock.indicators[2].value}**. \n\n`;
                botResponse += `Since the current price of **$${stock.price}** is ${parseFloat(stock.price) > parseFloat(stock.indicators[2].value) ? 'ABOVE' : 'BELOW'} the SMA 50, we consider the intermediate trend to be **${parseFloat(stock.price) > parseFloat(stock.indicators[2].value) ? 'BULLISH' : 'BEARISH'}**.`;
            } else {
                botResponse += `I'm tracking **${stock.ticker}** at **$${stock.price}** (+${stock.changePercent}%). \n\nThe technical setup shows a **${stock.strategies[0].signal}** stance. I can explain the current RSI levels, MACD crossovers, or help you with a risk-adjusted position size. What would you like to dive into?`;
            }

            const botMsg = {
                type: 'bot',
                text: botResponse,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                card: knowledgeCard
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex gap-6 h-full min-h-0">
            <div className="flex-1 glass-panel flex flex-col overflow-hidden backdrop-blur-2xl">
                <div className="p-8 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/20">
                            <MessageSquare size={28} />
                        </div>
                        <div>
                            <h3 className="font-black outfit text-2xl tracking-tighter">FinBot Intelligence</h3>
                            <p className="text-[10px] text-buy font-black flex items-center gap-2 uppercase tracking-[0.2em] mt-1">
                                <span className="w-2 h-2 bg-buy rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span> Synchronized with Live Exchange
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 bg-surface-alt hover:bg-slate-700 rounded-2xl text-text-muted transition-all hover:scale-105"><Info size={20} /></button>
                        <button className="p-3 bg-surface-alt hover:bg-slate-700 rounded-2xl text-text-muted transition-all hover:scale-105"><History size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-10 custom-scrollbar">
                    {messages.map((m, i) => <ChatMessage key={i} {...m} />)}
                    {isTyping && (
                        <div className="flex gap-2 p-4 bg-surface-alt/40 rounded-2xl w-24 items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-surface-alt/40 border-t border-border backdrop-blur-md">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex gap-4 bg-background/80 p-3 rounded-3xl border border-white/10 shadow-2xl items-center"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about MA Crossovers, P/E Valuations, or Sentiment Analysis..."
                            className="flex-1 bg-transparent border-none px-6 py-2 text-sm font-medium focus:outline-none placeholder:text-slate-600 text-white"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest pl-2">Analyze</span>
                            <Zap size={20} fill="white" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="w-96 glass-panel p-8 hidden xl:flex flex-col border-white/10 overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-10 text-center border-b border-border pb-4">Real-time Context</h3>

                <div className="flex-1 space-y-10">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center justify-between">
                            Active Analysis <BarChart3 size={12} className="text-primary" />
                        </p>
                        <div className="p-6 bg-gradient-to-br from-surface-alt to-transparent rounded-3xl border border-primary/20 shadow-xl shadow-primary/5 group cursor-pointer hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">{stock.ticker}</div>
                                <div>
                                    <p className="font-black outfit text-lg">{stock.name}</p>
                                    <p className="text-[10px] text-buy font-black tracking-widest">+1.98% VOLATILITY</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-white/5">
                                <span className="text-text-muted">MARKET PRICE</span>
                                <span className="text-white">${stock.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center justify-between">
                            Live Indicators <Activity size={12} className="text-accent" />
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {liveIndicators.map((i, idx) => (
                                <div key={idx} className="p-4 bg-background/50 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
                                    <p className="text-[9px] font-black text-text-muted mb-2 tracking-widest uppercase">{i.l}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-sm outfit">{i.v}</span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${i.s === 'BUY' || i.s === 'ACC' ? 'text-buy bg-buy/10' : 'text-primary bg-primary/10'}`}>{i.s}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-sell/10 via-background to-transparent rounded-3xl border border-sell/10 mt-auto">
                        <p className="text-[10px] text-sell font-black flex items-center gap-3 mb-3 uppercase tracking-[0.2em]">
                            <ShieldAlert size={14} /> Risk Protocol
                        </p>
                        <p className="text-[11px] text-text-muted leading-relaxed font-semibold italic">
                            "Live data suggests high volatility in the semiconductor sector. Verify stop-loss settings before execution."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatMessage = ({ type, text, time, card }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className={`flex flex-col ${type === 'user' ? 'items-end' : 'items-start'}`}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`max-w-[85%] p-6 rounded-[32px] ${type === 'user' ? 'bg-primary text-white rounded-tr-none shadow-2xl shadow-primary/30' : 'bg-surface-alt/80 backdrop-blur-xl rounded-tl-none border border-white/10 shadow-xl'}`}
            >
                <p className="text-sm leading-8 font-medium whitespace-pre-wrap">{text}</p>
                {card && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: isExpanded ? 'auto' : '60px' }}
                        className="mt-8 bg-background/60 rounded-[24px] border border-white/10 text-[11px] overflow-hidden relative cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="p-6 space-y-4">
                            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                                <BarChart3 size={100} />
                            </div>
                            <p className="font-black text-primary uppercase tracking-[0.3em] text-[9px] flex items-center gap-3">
                                <Info size={14} /> Knowledge Card {!isExpanded && "(Click to expand)"}
                            </p>
                            {isExpanded && (
                                <>
                                    <h4 className="text-lg font-black outfit text-white uppercase">{card.title}</h4>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                            <span className="text-text-muted font-black tracking-widest text-[9px]">ALGORITHMIC FORMULA</span>
                                            <code className="text-accent font-mono text-[11px] font-bold">{card.formula}</code>
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-text-muted font-black uppercase text-[9px] tracking-widest">Active Thresholds</span>
                                            <span className="font-black text-white">{card.thresholds}</span>
                                        </div>
                                        <p className="text-text-muted italic mt-2 text-[11px] leading-relaxed border-t border-white/5 pt-4 font-medium">{card.usage}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
            <span className="text-[9px] font-black text-slate-500 mt-3 px-4 uppercase tracking-[0.2em] opacity-40">{time}</span>
        </div>
    );
};


const RiskDisclaimer = () => (
    <div className="p-4 bg-sell/10 border border-sell/20 rounded-2xl mb-8 flex items-center gap-4">
        <ShieldAlert size={20} className="text-sell shrink-0" />
        <p className="text-[10px] font-bold text-sell uppercase tracking-widest leading-relaxed">
            Legal Disclaimer: This application is for educational and simulation purposes only. Market data shown may be delayed. The signals generated are based on mathematical formulas and do NOT constitute financial advice. Never trade with money you cannot afford to lose.
        </p>
    </div>
);

const TradingWidget = ({ stock }) => {
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleTrade = async (type) => {
        setLoading(true);
        try {
            if (type === 'BUY') {
                paperTrader.buy(stock.ticker, qty, parseFloat(stock.price));
            } else {
                paperTrader.sell(stock.ticker, qty, parseFloat(stock.price));
            }
            alert(`Paper Trade Successful: ${type} ${qty} shares of ${stock.ticker}`);
        } catch (e) {
            alert(e.message);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 mb-8">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] border-b border-border pb-2">Execution Terminal</h3>
            <div className="p-4 bg-background/50 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-text-muted">MARKET PRICE</span>
                    <span className="text-xl font-black outfit">${stock.price}</span>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase">Quantity</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => handleTrade('BUY')}
                        disabled={loading}
                        className="flex-1 bg-buy text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-buy/20"
                    >Buy</button>
                    <button
                        onClick={() => handleTrade('SELL')}
                        disabled={loading}
                        className="flex-1 bg-sell text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-sell/20"
                    >Sell</button>
                </div>
            </div>
        </div>
    );
};

const PositionSizer = ({ price }) => {
    const [riskAmount, setRiskAmount] = useState(1000);
    const [stopLoss, setStopLoss] = useState(5); // 5%

    const suggestedQty = Math.floor(riskAmount / (price * (stopLoss / 100)));

    return (
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mt-auto">
            <h4 className="text-[9px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={12} /> Position Sizer
            </h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-text-muted">RISK AMOUNT ($)</span>
                    <input
                        type="number"
                        value={riskAmount}
                        onChange={(e) => setRiskAmount(parseInt(e.target.value) || 0)}
                        className="w-16 bg-transparent text-right border-none focus:outline-none text-white"
                    />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-text-muted">STOP LOSS (%)</span>
                    <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(parseInt(e.target.value) || 0)}
                        className="w-16 bg-transparent text-right border-none focus:outline-none text-white"
                    />
                </div>
                <div className="pt-3 border-t border-primary/10 flex justify-between items-center">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Suggested Qty</span>
                    <span className="text-lg font-black outfit text-primary">{suggestedQty}</span>
                </div>
            </div>
        </div>
    );
};

export default App;
