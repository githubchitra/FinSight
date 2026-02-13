
import { calculateRSI, calculateMACD, calculateSMA, calculateVolumeConfirmation } from './indicators';

/**
 * Quantitative Signal Engine
 * Generates trading signals based on technical indicators.
 */

/**
 * Combined Strategy logic
 * 
 * BUY conditions:
 * - RSI < 35 (Oversold condition)
 * - MACD Histogram crossover (from negative to positive)
 * - Price > SMA 50 (Bullish trend confirmation)
 * - Volume Confirmation > 1.2 (High volume on move)
 * 
 * SELL conditions:
 * - RSI > 65 (Overbought condition)
 * - MACD Histogram crossunder (from positive to negative)
 * - Price < SMA 50 (Bearish trend confirmation)
 */
export const generateSignal = (ohlcv) => {
    if (!ohlcv || ohlcv.length < 50) {
        return {
            signal: 'HOLD',
            score: 0,
            reasons: 'Insufficient data for analysis.',
            indicators: { rsi: 'N/A', macd: 'N/A', sma: 'N/A' }
        };
    }

    const prices = ohlcv.map(d => d.close);
    const volumes = ohlcv.map(d => d.volume);
    const lastPrice = prices[prices.length - 1];

    // Calculate Indicators
    const rsi = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);
    const sma50 = calculateSMA(prices, 50);
    const volConf = calculateVolumeConfirmation(volumes, 20);

    const lastRSI = rsi[rsi.length - 1];
    const lastMACDHist = macd.histogram[macd.histogram.length - 1];
    const prevMACDHist = macd.histogram[macd.histogram.length - 2];
    const lastSMA50 = sma50[sma50.length - 1];
    const lastVolConf = volConf[volConf.length - 1];

    let buyWeight = 0;
    let sellWeight = 0;
    let buyReasons = [];
    let sellReasons = [];

    // RSI Logic
    if (lastRSI !== null) {
        if (lastRSI < 35) {
            buyWeight += 2;
            buyReasons.push(`RSI is oversold at ${lastRSI.toFixed(1)}`);
        } else if (lastRSI > 65) {
            sellWeight += 2;
            sellReasons.push(`RSI is overbought at ${lastRSI.toFixed(1)}`);
        }
    }

    // MACD Crossover Logic
    if (lastMACDHist !== null && prevMACDHist !== null) {
        if (prevMACDHist <= 0 && lastMACDHist > 0) {
            buyWeight += 3;
            buyReasons.push("MACD bullish crossover detected");
        } else if (prevMACDHist >= 0 && lastMACDHist < 0) {
            sellWeight += 3;
            sellReasons.push("MACD bearish crossover detected");
        } else if (lastMACDHist > 0) {
            buyWeight += 1;
        } else if (lastMACDHist < 0) {
            sellWeight += 1;
        }
    }

    // Trend Logic (SMA 50)
    if (lastSMA50 !== null) {
        if (lastPrice > lastSMA50) {
            buyWeight += 1.5;
            buyReasons.push("Price above SMA 50 (Bullish Trend)");
        } else {
            sellWeight += 1.5;
            sellReasons.push("Price below SMA 50 (Bearish Trend)");
        }
    }

    // Volume Confirmation
    if (lastVolConf > 1.2) {
        if (buyWeight > sellWeight) {
            buyWeight += 1;
            buyReasons.push("Strong volume confirming upward move");
        } else if (sellWeight > buyWeight) {
            sellWeight += 1;
            sellReasons.push("Strong volume confirming downward move");
        }
    }

    let signal = 'HOLD';
    let combinedReason = "Indicators are currently neutral or conflicting.";

    if (buyWeight >= 4 && buyWeight > sellWeight + 1) {
        signal = 'BUY';
        combinedReason = buyReasons.slice(0, 2).join(" and ");
    } else if (sellWeight >= 4 && sellWeight > buyWeight + 1) {
        signal = 'SELL';
        combinedReason = sellReasons.slice(0, 2).join(" and ");
    } else if (buyWeight > sellWeight) {
        combinedReason = "Slight bullish bias, but awaiting stronger confirmation.";
    } else if (sellWeight > buyWeight) {
        combinedReason = "Slight bearish bias, but awaiting stronger confirmation.";
    }

    return {
        signal,
        score: buyWeight - sellWeight,
        reasons: combinedReason,
        fullReasons: buyWeight > sellWeight ? buyReasons : sellReasons,
        indicators: {
            rsi: lastRSI ? lastRSI.toFixed(2) : 'N/A',
            macd: lastMACDHist ? lastMACDHist.toFixed(2) : 'N/A',
            sma: lastSMA50 ? lastSMA50.toFixed(2) : 'N/A',
            volConf: lastVolConf ? lastVolConf.toFixed(2) : 'N/A'
        }
    };
};

/**
 * Multi-Strategy Aggregator
 */
export const getAggregatedSignal = (ohlcv) => {
    return generateSignal(ohlcv);
};
