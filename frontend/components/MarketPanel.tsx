"use client";

import { useEffect, useState } from "react";
import { fetchMarketSnapshot, type MarketSnapshot } from "@/lib/api";

function Sparkline({ closes }: { closes: number[] }) {
  if (closes.length < 2) return null;
  const w = 100;
  const h = 32;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const points = closes
    .map((c, i) => {
      const x = (i / (closes.length - 1)) * w;
      const y = h - ((c - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#f2f0eb" strokeWidth="0.8" />
    </svg>
  );
}

export function MarketPanel({ symbol, timeframe }: { symbol: string; timeframe: string }) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMarketSnapshot(symbol, timeframe)
      .then((data) => !cancelled && setSnapshot(data))
      .catch((err: Error) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  return (
    <div className="rise-in border border-line p-6" style={{ animationDelay: "80ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg italic">Market</h2>
        <span className="text-xs text-dim">{snapshot?.exchange ?? "—"}</span>
      </div>

      {error && <p className="text-sm text-dim">Couldn&apos;t reach market data ({error}).</p>}

      {snapshot && (
        <div className="space-y-4">
          <div className="text-3xl">
            {snapshot.last_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <Sparkline closes={snapshot.candles.map((c) => c.close)} />
          <p className="text-xs text-dim">
            Last {snapshot.candles.length} &middot; {snapshot.timeframe} candles
          </p>
        </div>
      )}
    </div>
  );
}
