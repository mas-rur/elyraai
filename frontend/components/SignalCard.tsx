"use client";

import { useEffect, useState } from "react";
import { fetchSignal, type SignalResponse } from "@/lib/api";

const ACTION_STYLE: Record<string, string> = {
  BUY: "bg-paper text-ink border-paper",
  SELL: "bg-transparent text-paper border-paper",
  HOLD: "bg-transparent text-dim border-line",
};

export function SignalCard({ symbol, timeframe }: { symbol: string; timeframe: string }) {
  const [signal, setSignal] = useState<SignalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSignal(symbol, timeframe)
      .then((data) => !cancelled && setSignal(data))
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  return (
    <div className="rise-in border border-line p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg italic">Signal</h2>
        <span className="flex items-center gap-1.5 text-xs text-dim">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-paper" />
          {symbol} &middot; {timeframe}
        </span>
      </div>

      {loading && <p className="text-sm text-dim">Reading the model...</p>}
      {error && (
        <p className="text-sm text-dim">
          Couldn&apos;t reach the signal service ({error}). Is the backend running on{" "}
          <code>localhost:8000</code>?
        </p>
      )}

      {signal && (
        <div className="space-y-4">
          <div
            className={`inline-block border px-4 py-1.5 text-sm font-bold uppercase tracking-widest2 ${ACTION_STYLE[signal.action]}`}
          >
            {signal.action}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl">{Math.round(signal.confidence * 100)}%</span>
            <span className="text-xs uppercase tracking-widest2 text-dim">confidence</span>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-4 text-xs">
            <dt className="text-dim">Model</dt>
            <dd className="text-right">{signal.model_version}</dd>
            <dt className="text-dim">RSI (14)</dt>
            <dd className="text-right">{signal.features_used.rsi_14?.toFixed(1) ?? "—"}</dd>
            <dt className="text-dim">MACD hist</dt>
            <dd className="text-right">{signal.features_used.macd_hist?.toFixed(4) ?? "—"}</dd>
          </dl>

          <p className="border-t border-line pt-3 text-[11px] leading-relaxed text-dim">
            {signal.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
