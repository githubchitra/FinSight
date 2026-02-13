
import React, { useEffect, useRef, useState } from 'react';
import { fetchHistoricalData } from '../services/api';

const PriceChart = ({ ticker }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let chart;
        let isMounted = true;

        const initChart = async () => {
            try {
                // Dynamically import lightweight-charts
                const { createChart } = await import('lightweight-charts');

                if (!isMounted || !chartContainerRef.current) return;

                const historicalData = await fetchHistoricalData(ticker);

                if (!isMounted) return;
                setLoading(false);

                chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: { color: 'transparent' },
                        textColor: '#94a3b8',
                        fontFamily: 'Inter, sans-serif',
                    },
                    grid: {
                        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 400,
                    timeScale: {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        timeVisible: true,
                        secondsVisible: false,
                    },
                    crosshair: {
                        mode: 0,
                        vertLine: {
                            color: '#3b82f6',
                            width: 1,
                            style: 3,
                        },
                        horzLine: {
                            color: '#3b82f6',
                            width: 1,
                            style: 3,
                        },
                    },
                });

                const candleSeries = chart.addCandlestickSeries({
                    upColor: '#10b981',
                    downColor: '#ef4444',
                    borderVisible: false,
                    wickUpColor: '#10b981',
                    wickDownColor: '#ef4444',
                });

                candleSeries.setData(historicalData);

                const { calculateSMA, calculateEMA } = await import('../services/indicators');
                const prices = historicalData.map(d => d.close);

                // SMA 20
                const sma20Series = chart.addLineSeries({
                    color: '#3b82f6',
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                const smaValues = calculateSMA(prices, 20);
                sma20Series.setData(historicalData.map((d, i) => ({ time: d.time, value: smaValues[i] })).filter(d => d.value !== null));

                // EMA 50
                const ema50Series = chart.addLineSeries({
                    color: '#8b5cf6',
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                const emaValues = calculateEMA(prices, 50);
                ema50Series.setData(historicalData.map((d, i) => ({ time: d.time, value: emaValues[i] })).filter(d => d.value !== null));

                chartRef.current = chart;

                const handleResize = () => {
                    if (chartContainerRef.current) {
                        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                    }
                };

                window.addEventListener('resize', handleResize);

                // Fit content on initial load
                chart.timeScale().fitContent();

            } catch (error) {
                console.error("Failed to initialize chart:", error);
            }
        };

        setLoading(true);
        initChart();

        return () => {
            isMounted = false;
            window.removeEventListener('resize', () => { });
            if (chart) {
                chart.remove();
            }
        };
    }, [ticker]);

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-3xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Loading {ticker} Market Data...</p>
                    </div>
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />

            {/* Legend Overlay */}
            {!loading && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-[10px] font-black uppercase text-text-muted">SMA 20</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-accent rounded-full"></div>
                            <span className="text-[10px] font-black uppercase text-text-muted">EMA 50</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-buy rounded-sm"></div>
                            <span className="text-[10px] font-black uppercase text-text-muted">CANDLES</span>
                        </div>
                        <div className="h-3 w-[1px] bg-white/10 mx-1"></div>
                        <span className="text-[10px] font-black text-white">{ticker} / USD</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceChart;
