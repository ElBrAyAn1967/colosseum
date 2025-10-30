// Price oracle service using CoinGecko API with API key support
import { COINGECKO_API_KEY } from '../utils/constants';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_PRO_API_URL = 'https://pro-api.coingecko.com/api/v3';

// Use Pro API if API key is available, otherwise use public API
const API_URL = COINGECKO_API_KEY ? COINGECKO_PRO_API_URL : COINGECKO_API_URL;

// Helper to add API key to headers if available
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (COINGECKO_API_KEY) {
    headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
  }

  return headers;
}

/**
 * Get SOL price in MXN
 */
export async function getSolPrice() {
  try {
    const response = await fetch(
      `${API_URL}/simple/price?ids=solana&vs_currencies=mxn`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    return data.solana.mxn;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    throw error;
  }
}

/**
 * Get USDC price in MXN
 */
export async function getUsdcPrice() {
  try {
    const response = await fetch(
      `${API_URL}/simple/price?ids=usd-coin&vs_currencies=mxn`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    return data['usd-coin'].mxn;
  } catch (error) {
    console.error('Error fetching USDC price:', error);
    throw error;
  }
}

/**
 * Get USDT price in MXN
 */
export async function getUsdtPrice() {
  try {
    const response = await fetch(
      `${API_URL}/simple/price?ids=tether&vs_currencies=mxn`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tether.mxn;
  } catch (error) {
    console.error('Error fetching USDT price:', error);
    throw error;
  }
}

/**
 * Get multiple token prices in MXN
 */
export async function getTokenPrices(tokens = ['solana', 'usd-coin', 'tether']) {
  try {
    const response = await fetch(
      `${API_URL}/simple/price?ids=${tokens.join(',')}&vs_currencies=mxn&include_24hr_change=true`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw error;
  }
}

/**
 * Get price for specific token type
 */
export async function getPriceByTokenType(tokenType) {
  const tokenMap = {
    SOL: getSolPrice,
    USDC: getUsdcPrice,
    USDT: getUsdtPrice,
  };

  const priceFunction = tokenMap[tokenType];
  if (!priceFunction) {
    throw new Error(`Unsupported token type: ${tokenType}`);
  }

  return await priceFunction();
}

/**
 * Convert crypto amount to MXN
 */
export async function convertToMXN(amount, tokenType) {
  const price = await getPriceByTokenType(tokenType);
  return amount * price;
}

/**
 * Convert MXN to crypto amount
 */
export async function convertFromMXN(amountMXN, tokenType) {
  const price = await getPriceByTokenType(tokenType);
  return amountMXN / price;
}
