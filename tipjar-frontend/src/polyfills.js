// Polyfills for Solana web3.js in browser
import { Buffer } from 'buffer';

// Only set Buffer if it doesn't exist
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Set global if it doesn't exist
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}
