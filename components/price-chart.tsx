"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineData, Time, ColorType } from "lightweight-charts";
import { TimeRangeSelector } from "@/components/time-range-selector";
import { formatPercent, formatCurrency } from "@/lib/format";
import { type Currency } from "@/components/currency-selector";
import { LoadingState, ErrorState } from "@/components/states";

type ChartDataPoint = {
  time: number;
  value: number;
};

type PriceChartProps = {
  coinId: string;
  coinName?: string;
  currency: Currency;
  data?: ChartDataPoint[];
  isLoading?: boolean;
  error?: Error | null;
  onRangeChange: (range: TimeRange) => void;
};

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

export function PriceChart({
  coinId,
  coinName,
  currency,
  data: externalData,
  isLoading: externalLoading,
  error,
  onRangeChange,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const [range, setRange] = useState<TimeRange>("1D");

  // Pass through external data/loading state, but allow fallback to internal state if needed
  const data = externalData;
  const isLoading = externalLoading;
  const chartError = error;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)" as any,
        formatter: (price: number) => formatCurrency(price, currency),
      } as any,
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)" as any,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    let lineSeries: ISeriesApi<"Line"> | null = null;

    try {
      lineSeries = chart.addLineSeries({
        color: "#f97316",
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = lineSeries;
    } catch (err) {
      console.error("Failed to create chart series:", err);
      chart.remove();
      return;
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update price scale formatter when currency changes
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      rightPriceScale: {
        formatter: (price: number) => formatCurrency(price, currency),
      } as any,
    } as any);
  }, [currency]);

  // Update chart data when `data` changes
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return;

    const lineData: LineData[] = data.map((point) => ({
      time: point.time as Time,
      value: point.value,
    }));

    const firstPrice = data[0]?.value ?? 0;
    const lastPrice = data[data.length - 1]?.value ?? 0;
    const isUp = lastPrice >= firstPrice;

    const lineColor = isUp ? "#22c55e" : "#ef4444";

    seriesRef.current?.applyOptions({
      color: lineColor,
    });

    seriesRef.current?.setData(lineData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  const firstPrice = data?.[0]?.value ?? 0;
  const lastPrice = data?.[data.length - 1]?.value ?? 0;
  const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isUp = priceChange >= 0;

  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-foreground">
            {isLoading ? (
              <LoadingState message="" />
            ) : data ? (
              <>
                {formatCurrency(lastPrice, currency)}
                <span className="ml-2 text-xs text-muted">{currency}</span>
              </>
            ) : null}
          </div>
          {data && !isLoading && (
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className={isUp ? "text-green-500" : "text-red-500"}>
                {formatPercent(priceChange)}
              </span>
              <span className="text-muted">
                Updated {lastUpdated}
              </span>
            </div>
          )}
        </div>
        <TimeRangeSelector activeRange={range} onRangeChange={(r) => { setRange(r); onRangeChange(r); }} />
      </div>

      <div className="rounded-xl border border-border bg-surface-strong p-4 min-h-[400px] relative">
        <div ref={chartContainerRef} className="h-[400px]" />
        {chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-strong/80">
            <ErrorState
              message={chartError.message || "Failed to load chart data"}
              onRetry={() => {
                setChartError(null);
                window.location.reload();
              }}
            />
          </div>
        )}
        {(isLoading || !data) && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-strong/80">
            <LoadingState message="Loading chart..." />
          </div>
        )}
      </div>
    </div>
  );
};
