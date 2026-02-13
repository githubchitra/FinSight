
/**
 * Quantitative Financial Indicators Service
 * Implements standard formulas for technical analysis.
 */

/**
 * Simple Moving Average (SMA)
 * Formula: (P1 + P2 + ... + Pn) / n
 * @param {Array<number>} prices 
 * @param {number} period 
 * @returns {Array<number|null>}
 */
export const calculateSMA = (prices, period) => {
    const sma = new Array(prices.length).fill(null);
    for (let i = period - 1; i < prices.length; i++) {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma[i] = sum / period;
    }
    return sma;
};

/**
 * Exponential Moving Average (EMA)
 * Formula: EMA = (Price - EMA_prev) * Multiplier + EMA_prev
 * Multiplier = 2 / (period + 1)
 * @param {Array<number>} prices 
 * @param {number} period 
 * @returns {Array<number|null>}
 */
export const calculateEMA = (prices, period) => {
    const ema = new Array(prices.length).fill(null);
    if (prices.length < period) return ema;

    const multiplier = 2 / (period + 1);

    // Initial EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) sum += prices[i];
    ema[period - 1] = sum / period;

    for (let i = period; i < prices.length; i++) {
        ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
};

/**
 * Relative Strength Index (RSI)
 * Formula: 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 * Uses Wilder's smoothing (EMA-like) for the averages.
 * @param {Array<number>} prices 
 * @param {number} period 
 * @returns {Array<number|null>}
 */
export const calculateRSI = (prices, period = 14) => {
    const rsi = new Array(prices.length).fill(null);
    if (prices.length <= period) return rsi;

    let gains = 0;
    let losses = 0;

    // First average gain/loss (SMA)
    for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate initial RSI
    if (avgLoss === 0) rsi[period] = 100;
    else rsi[period] = 100 - (100 / (1 + (avgGain / avgLoss)));

    // Remaining RSI values using Wilder's smoothing
    for (let i = period + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        const currentGain = diff >= 0 ? diff : 0;
        const currentLoss = diff < 0 ? -diff : 0;

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

        if (avgLoss === 0) {
            rsi[i] = 100;
        } else {
            const rs = avgGain / avgLoss;
            rsi[i] = 100 - (100 / (1 + rs));
        }
    }
    return rsi;
};

/**
 * MACD (Moving Average Convergence Divergence)
 * MACD Line: 12-period EMA - 26-period EMA
 * Signal Line: 9-period EMA of MACD Line
 * Histogram: MACD Line - Signal Line
 * @param {Array<number>} prices 
 * @param {number} fast 
 * @param {number} slow 
 * @param {number} signal 
 * @returns {Object} { macd, signalLine, histogram }
 */
export const calculateMACD = (prices, fast = 12, slow = 26, signal = 9) => {
    const fastEMA = calculateEMA(prices, fast);
    const slowEMA = calculateEMA(prices, slow);

    const macdLine = new Array(prices.length).fill(null);
    for (let i = 0; i < prices.length; i++) {
        if (fastEMA[i] !== null && slowEMA[i] !== null) {
            macdLine[i] = fastEMA[i] - slowEMA[i];
        }
    }

    // Filter out nulls to calculate the signal line (EMA of MACD line)
    const firstValidIdx = macdLine.findIndex(v => v !== null);
    if (firstValidIdx === -1) return { macd: macdLine, signal: new Array(prices.length).fill(null), histogram: new Array(prices.length).fill(null) };

    const validMACDLine = macdLine.slice(firstValidIdx);
    const validSignalLine = calculateEMA(validMACDLine, signal);

    const signalLine = new Array(prices.length).fill(null);
    const histogram = new Array(prices.length).fill(null);

    for (let i = 0; i < validSignalLine.length; i++) {
        const originalIdx = i + firstValidIdx;
        signalLine[originalIdx] = validSignalLine[i];
        if (macdLine[originalIdx] !== null && signalLine[originalIdx] !== null) {
            histogram[originalIdx] = macdLine[originalIdx] - signalLine[originalIdx];
        }
    }

    return { macd: macdLine, signal: signalLine, histogram };
};

/**
 * Volume Confirmation Helper
 * Checks if current volume is strong relative to its average.
 * @param {Array<number>} volumes
 * @param {number} period 
 * @returns {Array<number|null>}
 */
export const calculateVolumeConfirmation = (volumes, period = 20) => {
    const confirmation = new Array(volumes.length).fill(null);
    if (volumes.length < period) return confirmation;

    for (let i = period - 1; i < volumes.length; i++) {
        const sum = volumes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        const avg = sum / period;
        confirmation[i] = volumes[i] / avg; // Ratio: > 1.0 means above average
    }
    return confirmation;
};
