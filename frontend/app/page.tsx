"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { SignalCard } from "@/components/SignalCard";
import { MarketPanel } from "@/components/MarketPanel";
import { TradePanel } from "@/components/TradePanel";
import type { SignalAction } from "@/lib/api";

// Demo token pair — replace with real addresses for whichever chain you deploy to.
const TOKEN_IN = { address: "0x0000000000000000000000000000000000dEaD", symbol: "USDT", decimals: 18 };
const TOKEN_OUT = { address: "0x0000000000000000000000000000000000bEEf", symbol: "WBTC", decimals: 8 };

export default function DashboardPage() {
  const [symbol] = useState("BTC/USDT");
  const [timeframe] = useState("1h");
  // In a full build, derive this from the live SignalResponse instead of
  // hardcoding — kept simple here since SignalCard owns its own fetch.
  const [lastAction] = useState<SignalAction>("HOLD");

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <p className="mb-8 max-w-xl text-sm text-dim">
          Elyra reads the market, a model calls a direction, and your wallet decides whether to act on
          it. Nothing moves without your signature.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <SignalCard symbol={symbol} timeframe={timeframe} />
          <MarketPanel symbol={symbol} timeframe={timeframe} />
          <TradePanel
            action={lastAction}
            tokenIn={TOKEN_IN}
            tokenOut={TOKEN_OUT}
            suggestedAmountIn="25"
            signalHash="0x0000000000000000000000000000000000000000000000000000000000000000"
          />
        </div>
      </div>
    </main>
  );
}
