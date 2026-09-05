const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type SignalAction = "BUY" | "SELL" | "HOLD";

export interface SignalResponse {
  symbol: string;
  timeframe: string;
  action: SignalAction;
  confidence: number;
  generated_at: number;
  features_used: Record<string, number>;
  model_version: string;
  disclaimer: string;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSnapshot {
  symbol: string;
  exchange: string;
  timeframe: string;
  last_price: number;
  candles: Candle[];
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Elyra API error ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchSignal(symbol: string, timeframe = "1h") {
  return getJson<SignalResponse>(`/signals/${encodeURIComponent(symbol)}?timeframe=${timeframe}`);
}

export function fetchMarketSnapshot(symbol: string, timeframe = "1h") {
  return getJson<MarketSnapshot>(`/market/${encodeURIComponent(symbol)}?timeframe=${timeframe}`);
}
