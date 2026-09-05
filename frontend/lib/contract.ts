import { BrowserProvider, Contract, type Signer } from "ethers";

/**
 * Minimal ABI — only the pieces the frontend actually calls or reads.
 * Keep this in sync with contracts/contracts/ElyraTradeExecutor.sol.
 * (For a bigger app, generate this from the Hardhat artifact instead of
 * hand-maintaining it.)
 */
export const ELYRA_EXECUTOR_ABI = [
  "function executeTrade(address tokenIn, address[] path, uint256 amountIn, uint256 minAmountOut, address router, uint256 deadline, bytes32 signalHash) external returns (uint256 amountOut)",
  "function allowedRouters(address router) view returns (bool)",
  "function paused() view returns (bool)",
  "event TradeExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, address router, bytes32 signalHash)",
] as const;

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
] as const;

// Fill these in per network after you deploy (see /contracts/scripts/deploy.js
// output) and after you've picked + verified a router to allowlist.
export const CONTRACT_ADDRESSES: Record<number, { executor: string; router: string }> = {
  // Sepolia
  11155111: {
    executor: process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS_SEPOLIA || "0x0000000000000000000000000000000000000000",
    router: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_SEPOLIA || "0x0000000000000000000000000000000000000000",
  },
  // BSC Testnet
  97: {
    executor: process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS_BSC_TESTNET || "0x0000000000000000000000000000000000000000",
    router: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_BSC_TESTNET || "0x0000000000000000000000000000000000000000",
  },
};

/**
 * Bridges the browser wallet (whatever RainbowKit connected) to an ethers.js
 * Signer, per the brief's requirement to use Ethers.js for the actual
 * contract interaction. RainbowKit/wagmi own connection state + UI; this is
 * the one place ethers touches the wallet.
 */
export async function getEthersSigner(): Promise<Signer> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found. Connect a wallet first.");
  }
  const provider = new BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export async function getExecutorContract(signer: Signer, chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) throw new Error(`Elyra is not deployed on chain ${chainId} yet.`);
  return new Contract(addresses.executor, ELYRA_EXECUTOR_ABI, signer);
}

export async function getErc20Contract(tokenAddress: string, signer: Signer) {
  return new Contract(tokenAddress, ERC20_ABI, signer);
}
