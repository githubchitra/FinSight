
/**
 * Paper Trading Engine
 * Manages virtual portfolios and trades.
 * This simulates market execution but does not perform real trades.
 */

const INITIAL_BALANCE = 100000; // $100k starting

export class TradingEngine {
    constructor() {
        this.loadProfile();
    }

    loadProfile() {
        const saved = localStorage.getItem('finbot_trade_profile');
        if (saved) {
            this.profile = JSON.parse(saved);
        } else {
            this.profile = {
                balance: INITIAL_BALANCE,
                locked: 0,
                positions: [], // { ticker, qty, avgPrice, totalCost }
                history: []   // { date, ticker, type, qty, price, pnl }
            };
            this.saveProfile();
        }
    }

    saveProfile() {
        localStorage.setItem('finbot_trade_profile', JSON.stringify(this.profile));
    }

    getStats() {
        return {
            balance: this.profile.balance,
            locked: this.profile.locked,
            equity: this.profile.balance + this.profile.locked,
            positionsCount: this.profile.positions.length,
            totalTrades: this.profile.history.length
        };
    }

    /**
     * Executes a Buy Order
     */
    buy(ticker, qty, price) {
        const cost = qty * price;
        if (this.profile.balance < cost) {
            throw new Error('Insufficient virtual funds.');
        }

        this.profile.balance -= cost;

        const existingPos = this.profile.positions.find(p => p.ticker === ticker);
        if (existingPos) {
            const totalQty = existingPos.qty + qty;
            const totalCost = existingPos.qty * existingPos.avgPrice + cost;
            existingPos.qty = totalQty;
            existingPos.avgPrice = totalCost / totalQty;
        } else {
            this.profile.positions.push({ ticker, qty, avgPrice: price });
        }

        this.profile.history.push({
            date: new Date().toISOString(),
            ticker,
            type: 'BUY',
            qty,
            price,
            total: cost
        });

        this.saveProfile();
        return true;
    }

    /**
     * Executes a Sell Order
     */
    sell(ticker, qty, price) {
        const posIndex = this.profile.positions.findIndex(p => p.ticker === ticker);
        if (posIndex === -1 || this.profile.positions[posIndex].qty < qty) {
            throw new Error('Insufficient position quantity.');
        }

        const position = this.profile.positions[posIndex];
        const proceeds = qty * price;
        const costBasis = qty * position.avgPrice;
        const pnl = proceeds - costBasis;

        this.profile.balance += proceeds;
        position.qty -= qty;

        if (position.qty === 0) {
            this.profile.positions.splice(posIndex, 1);
        }

        this.profile.history.push({
            date: new Date().toISOString(),
            ticker,
            type: 'SELL',
            qty,
            price,
            total: proceeds,
            pnl
        });

        this.saveProfile();
        return { proceeds, pnl };
    }

    getPositionsWithPnL(currentPrices) {
        return this.profile.positions.map(p => {
            const currentPrice = currentPrices[p.ticker] || p.avgPrice;
            const marketValue = p.qty * currentPrice;
            const unrealizedPnL = marketValue - (p.qty * p.avgPrice);
            const pnlPercent = ((currentPrice - p.avgPrice) / p.avgPrice) * 100;

            return {
                ...p,
                currentPrice,
                marketValue,
                unrealizedPnL,
                pnlPercent: pnlPercent.toFixed(2) + '%'
            };
        });
    }

    clearHistory() {
        this.profile = {
            balance: INITIAL_BALANCE,
            locked: 0,
            positions: [],
            history: []
        };
        this.saveProfile();
    }
}

export const paperTrader = new TradingEngine();
