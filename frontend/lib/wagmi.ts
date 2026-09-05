import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, bsc, bscTestnet } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Elyra",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "REPLACE_WITH_WALLETCONNECT_PROJECT_ID",
  chains: [sepolia, bscTestnet, mainnet, bsc],
  ssr: true,
});
