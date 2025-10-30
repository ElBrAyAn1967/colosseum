/**
 * Truncate wallet address for display
 * @param {string} address - Full wallet address
 * @param {number} chars - Number of characters to show on each side
 * @returns {string} Truncated address
 */
export function truncateAddress(address, chars = 4) {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatAmount(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert lamports to SOL
 * @param {number} lamports
 * @returns {number}
 */
export function lamportsToSol(lamports) {
  return lamports / 1e9;
}

/**
 * Convert SOL to lamports
 * @param {number} sol
 * @returns {number}
 */
export function solToLamports(sol) {
  return Math.floor(sol * 1e9);
}

/**
 * Calculate platform fee
 * @param {number} amount - Order amount
 * @param {number} feeBps - Fee in basis points (50 = 0.5%)
 * @returns {number} Fee amount
 */
export function calculateFee(amount, feeBps = 50) {
  return (amount * feeBps) / 10000;
}

/**
 * Format date for display
 * @param {number|Date} timestamp - Unix timestamp or Date object
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate random order ID
 * @returns {string} Order ID
 */
export function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Validate MXN amount (must not exceed 9,000 MXN)
 * @param {number} amount - Amount in MXN
 * @returns {boolean} Is valid
 */
export function validateMxnAmount(amount) {
  return amount > 0 && amount <= 9000;
}

/**
 * Sleep function for async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Parse order status from Anchor enum
 * @param {Object} status - Status object from Anchor
 * @returns {string} Status string
 */
export function parseOrderStatus(status) {
  const keys = Object.keys(status);
  if (keys.length === 0) return 'unknown';

  // Convert camelCase to lowercase with hyphens
  return keys[0].replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

/**
 * Format wallet public key for display
 * @param {PublicKey} publicKey - Solana PublicKey
 * @returns {string} Formatted address
 */
export function formatPublicKey(publicKey) {
  if (!publicKey) return '';
  return truncateAddress(publicKey.toString());
}
