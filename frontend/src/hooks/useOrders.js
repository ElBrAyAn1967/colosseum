import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';

/**
 * Hook to manage order operations
 */
export function useOrders() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all orders
  const fetchOrders = async () => {
    if (!program) return;

    try {
      setLoading(true);
      const allOrders = await program.account.order.all();
      setOrders(allOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [program]);

  // Create order
  const createOrder = async (orderId, amount, amountMxn, tokenType, paymentMethod, stpReference) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    try {
      setLoading(true);
      const tx = await program.methods
        .createOrder(orderId, amount, amountMxn, tokenType, paymentMethod, stpReference)
        .accounts({
          seller: publicKey,
        })
        .rpc();

      console.log('Order created:', tx);
      await fetchOrders(); // Refresh orders
      return tx;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Accept order
  const acceptOrder = async (orderPubkey) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    try {
      setLoading(true);
      const tx = await program.methods
        .acceptOrder()
        .accounts({
          order: new PublicKey(orderPubkey),
          buyer: publicKey,
        })
        .rpc();

      console.log('Order accepted:', tx);
      await fetchOrders(); // Refresh orders
      return tx;
    } catch (err) {
      console.error('Error accepting order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's orders (as seller or buyer)
  const getUserOrders = () => {
    if (!publicKey) return [];

    return orders.filter(
      (order) =>
        order.account.seller.toString() === publicKey.toString() ||
        order.account.buyer?.toString() === publicKey.toString()
    );
  };

  // Get open orders (marketplace)
  const getOpenOrders = () => {
    return orders.filter((order) => order.account.status.hasOwnProperty('open'));
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    acceptOrder,
    fetchOrders,
    getUserOrders,
    getOpenOrders,
  };
}
