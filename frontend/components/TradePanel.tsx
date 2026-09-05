"use client";

import { useState } from "react";
import { parseUnits } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { CONTRACT_ADDRESSES, getErc20Contract, getEthersSigner, getExecutorContract } from "@/lib/contract";
import type { SignalAction } from "@/lib/api";

type Step = "idle" | "approving" | "swapping" | "done" | "error";

interface TradePanelProps {
  action: SignalAction;
  tokenIn: { address: string; symbol: string; decimals: number };
  tokenOut: { address: string; symbol: string; decimals: number };
  suggestedAmountIn: string; // human units, e.g. "25"
  signalHash: string; // keccak256 of the signal payload, from the backend
}

export function TradePanel({ action, tokenIn, tokenOut, suggestedAmountIn, signalHash }: TradePanelProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [amount, setAmount] = useState(suggestedAmountIn);
  const [slippageBps, setSlippageBps] = useState(50); // 0.50%
  const [step, setStep] = useState<Step>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const disabled = action === "HOLD" || !isConnected || step === "approving" || step === "swapping";

  async function handleExecute() {
    setErrorMsg(null);
    setTxHash(null);
    try {
      const addresses = CONTRACT_ADDRESSES[chainId];
      if (!addresses) throw new Error(`Elyra isn't deployed on chain ${chainId} yet.`);

      const signer = await getEthersSigner();
      const amountIn = parseUnits(amount, tokenIn.decimals);

      // Step 1: approve — sized to THIS trade only, never an unlimited allowance.
      setStep("approving");
      const tokenContract = await getErc20Contract(tokenIn.address, signer);
      const approveTx = await tokenContract.approve(addresses.executor, amountIn);
      await approveTx.wait();

      // Step 2: the user's own wallet signs the swap. Elyra's backend never
      // sees a private key and never submits this transaction itself.
      setStep("swapping");
      const executor = await getExecutorContract(signer, chainId);

      // NOTE: in production, fetch a live quote for minAmountOut from the
      // router/aggregator instead of a placeholder — this is where real
      // slippage protection comes from.
      const minAmountOut = 0n; // TODO: wire up a real quote before mainnet use
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

      const tx = await executor.executeTrade(
        tokenIn.address,
        [tokenIn.address, tokenOut.address],
        amountIn,
        minAmountOut,
        addresses.router,
        deadline,
        signalHash
      );
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Trade failed.");
      setStep("error");
    }
  }

  return (
    <div className="rise-in border border-line p-6" style={{ animationDelay: "160ms" }}>
      <h2 className="mb-4 font-display text-lg italic">Execute</h2>

      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-dim">Route</span>
          <span>
            {tokenIn.symbol} → {tokenOut.symbol}
          </span>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-dim">Amount ({tokenIn.symbol})</span>
          <input
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-mono text-paper outline-none focus:border-paper"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-dim">Max slippage (bps)</span>
          <input
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-mono text-paper outline-none focus:border-paper"
            type="number"
            value={slippageBps}
            onChange={(e) => setSlippageBps(Number(e.target.value))}
          />
        </label>

        <button
          onClick={handleExecute}
          disabled={disabled}
          className="w-full border border-paper py-3 text-xs uppercase tracking-widest2 transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          {!isConnected
            ? "Connect a wallet to trade"
            : action === "HOLD"
              ? "Signal is HOLD — nothing to execute"
              : step === "approving"
                ? "Confirm approval in wallet..."
                : step === "swapping"
                  ? "Confirm trade in wallet..."
                  : `Sign & execute ${action}`}
        </button>

        {txHash && <p className="break-all text-xs text-dim">Confirmed: {txHash}</p>}
        {errorMsg && <p className="text-xs text-dim">{errorMsg}</p>}

        <p className="border-t border-line pt-3 text-[11px] leading-relaxed text-dim">
          You sign every trade yourself. Elyra never holds your funds or your keys — the contract only
          moves tokens for the duration of this one transaction.
        </p>
      </div>
    </div>
  );
}
