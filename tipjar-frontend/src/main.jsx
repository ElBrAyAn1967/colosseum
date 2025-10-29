import { Buffer } from "buffer";
window.Buffer = Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  SlopeWalletAdapter,
  TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

// Get network from environment variable (devnet, testnet, mainnet-beta)
const network = import.meta.env.VITE_NETWORK || "devnet";

// Get RPC endpoint from environment or use default
const endpoint = import.meta.env.VITE_RPC_URL || clusterApiUrl(network);

// Configure supported wallets
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new BackpackWalletAdapter(),
  new SlopeWalletAdapter(),
  new TorusWalletAdapter(),
];

console.log("🚀 Solanita P2P - Starting...");
console.log("📡 Network:", network);
console.log("🔗 RPC Endpoint:", endpoint);
console.log("💰 Program ID:", import.meta.env.VITE_PROGRAM_ID || "Not set");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
