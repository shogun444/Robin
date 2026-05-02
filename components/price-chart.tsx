"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, ColorType, LineData, Time } from "lightweight-charts";
import { useChartData, TimeRange } from "@/hooks/use-chart-data";
import { TimeRangeSelector } from "@/components/time-range-selector";
import { formatPercent, formatUsd } from "@/lib/format";

type PriceChartProps = {
  coinId: string;
  coinName?: string;
};

export function PriceChart({ coinId, coinName }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [range, setRange] = useState<TimeRange>("1D");

  const { data, error, isLoading } = useChartData(coinId, range);

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
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255, 255, 255, 0.2)",
          width: 1,
          style: 2,
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.2)",
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const lineSeries = chart.addSeries("Line", {
      color: "#f97316",
      lineWidth: 2,
      lineStyle: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: "#f97316",
      crosshairMarkerBackgroundColor: "#1a1a1a",
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

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
      chart.remove();
    };
  }, []);

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

    seriesRef.current.applyOptions({
      color: lineColor,
      crosshairMarkerBorderColor: lineColor,
    });

    seriesRef.current.setData(lineData);

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
            {isLoading ? "Loading..." : formatUsd(lastPrice)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {isLoading ? (
              <span className="text-muted">Loading...</span>
            ) : (
              <>
                <span className={isUp ? "text-green-500" : "text-red-500"}>
                  {isUp ? "+" : ""}{formatPercent(priceChange)}
                </span>
                <span className="text-muted">
                  Updated {lastUpdated}
                </span>
              </>
            )}
          </div>
        </div>
        <TimeRangeSelector activeRange={range} onRangeChange={setRange} />
      </div>

      <div className="rounded-xl border border-border bg-surface-strong p-4">
        {error ? (
          <div className="flex h-[400px] items-center justify-center text-muted">
            Failed to load chart data
          </div>
        ) : (
          <div ref={chartContainerRef} className="h-[400px]" />
        )}
      </div>
    </div>
  );
}
