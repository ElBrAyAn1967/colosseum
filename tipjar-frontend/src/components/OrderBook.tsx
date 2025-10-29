import React, { useEffect, useState } from 'react';
import { useP2PProgram } from '../hooks/useP2PProgram';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

interface Order {
  publicKey: PublicKey;
  account: {
    orderId: string;
    seller: PublicKey;
    buyer: PublicKey | null;
    amount: any;
    amountMxn: any;
    tokenType: any;
    paymentMethod: any;
    status: any;
    stpReference: string;
    createdAt: any;
  };
}

export function OrderBook() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const { fetchOpenOrders, acceptOrder, depositToEscrowNative } = useP2PProgram();
  const wallet = useWallet();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const openOrders = await fetchOpenOrders();
      setOrders(openOrders as any);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderPda: PublicKey, sellerPubkey: PublicKey) => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const tx = await acceptOrder(orderPda, sellerPubkey);
      alert(`Order accepted! TX: ${tx}`);
      await loadOrders();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatAmount = (amount: any, decimals: number = 9) => {
    return (amount.toNumber() / 10 ** decimals).toFixed(4);
  };

  const formatMxn = (amount: any) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount.toNumber() / 1_000_000);
  };

  const getTokenSymbol = (tokenType: any) => {
    if (tokenType.sol) return 'SOL';
    if (tokenType.usdc) return 'USDC';
    if (tokenType.usdt) return 'USDT';
    return 'Unknown';
  };

  const getPaymentMethod = (paymentMethod: any) => {
    if (paymentMethod.stp) return 'STP';
    if (paymentMethod.spei) return 'SPEI';
    if (paymentMethod.cash) return 'Cash';
    return 'Unknown';
  };

  const calculateRate = (cryptoAmount: number, mxnAmount: number) => {
    return (mxnAmount / cryptoAmount).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Book</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('buy')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Buy Crypto
          </button>
          <button
            onClick={() => setFilter('sell')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sell Crypto
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No active orders</p>
          <p className="text-gray-400 mt-2">Be the first to create one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Seller
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Price (MXN)
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Rate
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Payment
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const token = getTokenSymbol(order.account.tokenType);
                const decimals = token === 'SOL' ? 9 : 6;
                const amount = parseFloat(formatAmount(order.account.amount, decimals));
                const mxnAmount = order.account.amountMxn.toNumber() / 1_000_000;
                const rate = calculateRate(amount, mxnAmount);

                return (
                  <tr
                    key={order.publicKey.toString()}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {order.account.orderId}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-600">
                        {order.account.seller.toString().slice(0, 4)}...
                        {order.account.seller.toString().slice(-4)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-gray-900">
                        {amount} {token}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-green-600">
                        {formatMxn(order.account.amountMxn)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm text-gray-600">
                        ${rate} MXN/{token}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getPaymentMethod(order.account.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {wallet.publicKey &&
                      !wallet.publicKey.equals(order.account.seller) ? (
                        <button
                          onClick={() =>
                            handleAcceptOrder(order.publicKey, order.account.seller)
                          }
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Buy Crypto
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Your order</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {orders.length} active orders
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
