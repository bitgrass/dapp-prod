'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

interface PriceChartProps {
  pairAddress: string;
  theme?: 'light' | 'dark';
}

export default function PriceChart({ pairAddress, theme = 'dark' }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch data once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // GeckoTerminal uses lowercase addresses
        const normalizedPairAddress = pairAddress.toLowerCase();
        
        // Fetch OHLCV data from GeckoTerminal (365 days, daily candles)
        const ohlcvResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/base/pools/${normalizedPairAddress}/ohlcv/day?aggregate=1&limit=365&currency=usd`
        );

        if (!ohlcvResponse.ok) {
          if (ohlcvResponse.status === 404) {
            throw new Error('Pool not found');
          }
          throw new Error('Failed to fetch price data');
        }

        const ohlcvData = await ohlcvResponse.json();
        
        if (!ohlcvData?.data?.attributes?.ohlcv_list || ohlcvData.data.attributes.ohlcv_list.length === 0) {
          throw new Error('Pair not found');
        }

        // Convert GeckoTerminal OHLCV format to chart format
        // Format: [[timestamp, open, high, low, close, volume], ...]
        const generatedData = ohlcvData.data.attributes.ohlcv_list.map((item: number[]) => ({
          time: item[0] as any, // Timestamp is already in seconds
          value: item[4], // Close price (index 4)
        }));

        // Sort by time to ensure correct order
        generatedData.sort((a :any, b : any) => a.time - b.time);

        // Remove any invalid data points
        const validData = generatedData.filter((item : any) => 
          item.value > 0 && 
          isFinite(item.value) &&
          item.time > 0
        );

        if (validData.length === 0) {
          throw new Error('Failed to load chart data');
        }

        setChartData(validData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
        setLoading(false);
      }
    };

    fetchData();
  }, [pairAddress]);

  // Create/update chart when theme changes or data is ready
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // Get bg-camel color from Tailwind
    const getBgCamelColor = () => {
      const tempDiv = document.createElement('div');
      tempDiv.className = 'bg-camel';
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      document.body.appendChild(tempDiv);
      const bgColor = getComputedStyle(tempDiv).backgroundColor;
      document.body.removeChild(tempDiv);
      return bgColor || (theme === 'dark' ? '#1a1a1a' : '#f5f3eb');
    };

    const bgColor = getBgCamelColor();
    const textColor = theme === 'dark' ? '#d1d5db' : '#6b7280';

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.3,
          bottom: 0.25,
        },
      },
    });

    // Apply options to hide grid and crosshair
    chart.applyOptions({
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          labelVisible: false,
        },
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
    });

    chartRef.current = chart;

    // Create area series with gradient
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(127, 196, 71, 0.56)',
      bottomColor: 'rgba(127, 196, 71, 0.04)',
      lineColor: '#7fc447',
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });

    seriesRef.current = areaSeries;

    // Setup tracking tooltip (follows cursor)
    if (tooltipRef.current && chartContainerRef.current) {
      const tooltip = tooltipRef.current;
      const container = chartContainerRef.current;
      const toolTipWidth = 140;
      const toolTipMargin = 15;

      chart.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > container.clientWidth ||
          param.point.y < 0 ||
          param.point.y > container.clientHeight
        ) {
          tooltip.style.display = 'none';
        } else {
          const data = param.seriesData.get(areaSeries);
          if (data) {
            const price = (data as any).value !== undefined ? (data as any).value : (data as any).close;
            const dateStr = new Date((param.time as number) * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            tooltip.style.display = 'block';
            tooltip.innerHTML = `
              <div style="color: #7fc447; font-weight: 600; margin-bottom: 4px;">$BTG</div>
              <div style="font-size: 20px; font-weight: bold; margin: 4px 0; color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};">$${price.toFixed(2)}</div>
              <div style="font-size: 12px; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};">${dateStr}</div>
            `;

            // Position tooltip next to cursor
            let shiftedCoordinate = param.point.x - toolTipWidth / 2;
            shiftedCoordinate = Math.max(
              0,
              Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate)
            );
            
            tooltip.style.left = shiftedCoordinate + 'px';
            tooltip.style.top = (param.point.y - 80) + 'px';
          }
        }
      });
    }

    // Set data to the series
    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          // Chart already disposed, ignore error
        }
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [theme, chartData]);

  return (
    <div className="w-full relative">
      {loading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textmuted">Loading chart...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center text-danger">
            <p>{error}</p>
          </div>
        </div>
      )}

      <div
        ref={chartContainerRef}
        className={`w-full ${loading || error ? 'hidden' : ''}`}
        style={{ minHeight: '400px' }}
      />
      
      {/* Tracking Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          width: '140px',
          position: 'absolute',
          display: 'none',
          padding: '10px',
          boxSizing: 'border-box',
          fontSize: '12px',
          textAlign: 'left',
          zIndex: 1000,
          top: '12px',
          left: '12px',
          pointerEvents: 'none',
          border: `1px solid #7fc447`,
          borderRadius: '6px',
          background: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      />
    </div>
  );
}