"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-5 md:px-10">
      <div className="flex items-center gap-3">
        {/* Wordmark, not an icon — keeps things monochrome and avoids a generic AI-logo look */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M14 1 L27 14 L14 27 L1 14 Z" stroke="#f2f0eb" strokeWidth="1.4" />
          <path d="M14 7 L21 14 L14 21 L7 14 Z" fill="#f2f0eb" />
        </svg>
        <span className="font-display text-xl italic tracking-wide">Elyra</span>
      </div>

      <div className="hidden text-xs uppercase tracking-widest2 text-dim md:block">
        Non-custodial &middot; AI-assisted &middot; your keys, your trade
      </div>

      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
      />
    </header>
  );
}
