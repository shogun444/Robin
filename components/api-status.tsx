"use client";

import { useState, useEffect } from "react";

type ApiStatus = "checking" | "healthy" | "degraded" | "down";

export function ApiStatus() {
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [apiName, setApiName] = useState<string>("CoinGecko");

  useEffect(() => {
    // Check API status
    const checkStatus = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/ping");
        if (response.ok) {
          setStatus("healthy");
          setApiName("CoinGecko");
        } else {
          throw new Error("CoinGecko failed");
        }
      } catch {
        try {
          const response = await fetch("https://api.binance.com/api/v3/ping");
          if (response.ok) {
            setStatus("degraded");
            setApiName("Binance");
          } else {
            throw new Error("Binance failed");
          }
        } catch {
          try {
            const response = await fetch("https://api.coinpaprika.com/v1/coins");
            if (response.ok) {
              setStatus("degraded");
              setApiName("CoinPaprika");
            } else {
              setStatus("down");
            }
          } catch {
            setStatus("down");
          }
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    checking: "text-muted",
    healthy: "text-green-500",
    degraded: "text-yellow-500",
    down: "text-red-500",
  };

  const statusText = {
    checking: "Checking...",
    healthy: "All systems operational",
    degraded: "Using backup data source",
    down: "Service unavailable",
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        status === "healthy" ? "bg-green-500" :
        status === "degraded" ? "bg-yellow-500" :
        status === "down" ? "bg-red-500" : "bg-gray-500 animate-pulse"
      }`} />
      <span className="text-muted">{apiName}</span>
      <span className={statusColors[status]}>{statusText[status]}</span>
    </div>
  );
}
