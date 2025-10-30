// Oracle Backend API service
const ORACLE_API_URL = import.meta.env.VITE_ORACLE_BACKEND_URL || 'http://localhost:3001';

/**
 * Verify STP payment
 */
export async function verifyStpPayment(orderId, stpTransactionId) {
  const response = await fetch(`${ORACLE_API_URL}/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      stpTransactionId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
}

/**
 * Get order verification status
 */
export async function getOrderStatus(orderId) {
  const response = await fetch(`${ORACLE_API_URL}/order/${orderId}/status`);

  if (!response.ok) {
    throw new Error('Failed to get order status');
  }

  return response.json();
}

/**
 * Get current SOL to MXN price
 */
export async function getSolToMxnPrice() {
  const response = await fetch(`${ORACLE_API_URL}/price/sol-mxn`);

  if (!response.ok) {
    throw new Error('Failed to get price');
  }

  return response.json();
}

/**
 * Get current USDC to MXN price
 */
export async function getUsdcToMxnPrice() {
  const response = await fetch(`${ORACLE_API_URL}/price/usdc-mxn`);

  if (!response.ok) {
    throw new Error('Failed to get price');
  }

  return response.json();
}
