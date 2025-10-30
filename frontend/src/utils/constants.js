import { PublicKey } from '@solana/web3.js';

// Program ID from IDL
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || '4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun'
);

// Network
export const NETWORK = import.meta.env.VITE_NETWORK || 'devnet';

// RPC Endpoint
export const RPC_ENDPOINT =
  import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com';

// Token Types
export const TOKEN_TYPES = {
  SOL: { label: 'SOL', decimals: 9 },
  USDC: { label: 'USDC', decimals: 6 },
  USDT: { label: 'USDT', decimals: 6 },
};

// Order Status
export const ORDER_STATUS = {
  OPEN: 'open',
  ACCEPTED: 'accepted',
  FUNDED: 'funded',
  PAYMENT_CONFIRMED: 'payment-confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

// Payment Methods
export const PAYMENT_METHODS = {
  STP: 'STP',
  SPEI: 'SPEI',
  CASH: 'Cash',
};

// Transaction Limits
export const MAX_ORDER_AMOUNT_MXN = 9000; // Mexican regulation limit
export const PLATFORM_FEE_BPS = 50; // 0.5% = 50 basis points

// KYC Levels
export const KYC_LEVELS = {
  NONE: 0,
  BASIC: 1,
  STANDARD: 2,
  ENHANCED: 3,
  PREMIUM: 4,
};

// Solana Explorer URLs
export const EXPLORER_URLS = {
  devnet: 'https://explorer.solana.com',
  mainnet: 'https://explorer.solana.com',
  testnet: 'https://explorer.solana.com',
};

// Get explorer URL for transaction
export function getExplorerUrl(signature, cluster = NETWORK) {
  return `${EXPLORER_URLS[cluster]}/tx/${signature}?cluster=${cluster}`;
}

// Get explorer URL for address
export function getAddressExplorerUrl(address, cluster = NETWORK) {
  return `${EXPLORER_URLS[cluster]}/address/${address}?cluster=${cluster}`;
}

// API Keys and Configuration
export const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
export const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
export const CIVIC_GATEWAY_NETWORK = import.meta.env.VITE_CIVIC_GATEWAY_NETWORK || 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6';
export const CIVIC_API_KEY = import.meta.env.VITE_CIVIC_API_KEY;
export const ORACLE_BACKEND_URL = import.meta.env.VITE_ORACLE_BACKEND_URL || 'http://localhost:3001';
