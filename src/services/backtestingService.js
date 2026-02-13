
import { generateSignal } from './signalEngine';

/**
 * Backtesting Engine
 * Runs strategies against historical OHLCV data to evaluate performance.
 */

export const runBacktest = (ohlcv, strategyName = 'Combined') => {
    if (!ohlcv || ohlcv.length < 100) {
        return {
            stats: [],
            trades: [],
            equityCurve: []
        };
    }

    const initialBalance = 10000;
    let balance = initialBalance;
    let position = 0; // 0: None, 1: Long
    let entryPrice = 0;
    let entryDate = '';
    const trades = [];
    const equityCurve = [];

    // Run strategy starting from index 50 (to have enough data for indicators)
    for (let i = 50; i < ohlcv.length; i++) {
        const slicedData = ohlcv.slice(0, i + 1);
        const signalObj = generateSignal(slicedData);
        const currentPrice = ohlcv[i].close;
        const currentDate = ohlcv[i].time;

        if (signalObj.signal === 'BUY' && position === 0) {
            // Enter Long
            position = 1;
            entryPrice = currentPrice;
            entryDate = currentDate;
        } else if (signalObj.signal === 'SELL' && position === 1) {
            // Exit Long
            const pnl = (currentPrice - entryPrice) / entryPrice;
            const absolutePnl = (currentPrice - entryPrice) * (initialBalance / entryPrice);
            balance += absolutePnl;

            trades.push({
                date: entryDate,
                exitDate: currentDate,
                type: 'LONG',
                entry: entryPrice.toFixed(2),
                exit: currentPrice.toFixed(2),
                pnl: (pnl * 100).toFixed(2) + '%',
                status: pnl > 0 ? 'Win' : 'Loss'
            });

            position = 0;
        }

        equityCurve.push({
            name: currentDate,
            strategy: balance + (position === 1 ? (currentPrice - entryPrice) * (initialBalance / entryPrice) : 0),
            benchmark: (currentPrice / ohlcv[50].close) * initialBalance
        });
    }

    // Finalize stats
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === 'Win').length;
    const winRate = totalTrades > 0 ? (wins / totalTrades * 100).toFixed(1) + '%' : '0%';
    const totalReturn = ((balance - initialBalance) / initialBalance * 100).toFixed(1) + '%';

    // Max Drawdown calculation (simplified)
    let maxBalance = initialBalance;
    let maxDD = 0;
    equityCurve.forEach(p => {
        if (p.strategy > maxBalance) maxBalance = p.strategy;
        const dd = (maxBalance - p.strategy) / maxBalance;
        if (dd > maxDD) maxDD = dd;
    });

    return {
        stats: [
            { label: 'Total Return', value: totalReturn, sub: 'Strategy vs Benchmark', color: balance >= initialBalance ? 'text-buy' : 'text-sell' },
            { label: 'Win Rate', value: winRate, sub: `${wins} wins out of ${totalTrades}`, color: 'text-primary' },
            { label: 'Max Drawdown', value: (maxDD * 100).toFixed(1) + '%', sub: 'Peak to trough decline', color: 'text-sell' },
            { label: 'Final Balance', value: `$${balance.toFixed(2)}`, sub: 'Starting: $10,000', color: 'text-white' }
        ],
        trades: trades.reverse(),
        equityCurve
    };
};
