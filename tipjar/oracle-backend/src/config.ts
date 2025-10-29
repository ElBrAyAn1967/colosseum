import dotenv from 'dotenv';
import { PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

dotenv.config();

export const config = {
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'http://localhost:8899',
    network: process.env.SOLANA_NETWORK || 'devnet',
    programId: new PublicKey(process.env.PROGRAM_ID || '4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun'),
  },

  oracle: {
    keypair: process.env.ORACLE_PRIVATE_KEY
      ? Keypair.fromSecretKey(bs58.decode(process.env.ORACLE_PRIVATE_KEY))
      : Keypair.generate(),
  },

  stp: {
    apiUrl: process.env.STP_API_URL || 'https://api-sandbox.stpmex.com',
    apiKey: process.env.STP_API_KEY || 'SIMULATED_API_KEY',
    companyId: process.env.STP_COMPANY_ID || 'DEMO_COMPANY',
  },

  server: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'dev_secret_change_in_production',
  },

  polling: {
    intervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '30000'),
  },
};

export default config;
