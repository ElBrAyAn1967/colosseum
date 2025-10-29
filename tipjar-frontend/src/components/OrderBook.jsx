import React, { useEffect, useState } from 'react';
import { useP2PProgram } from '../hooks/useP2PProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function OrderBook() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const { fetchAllOrders, acceptOrder, publicKey } = useP2PProgram();
  const { connected } = useWallet();

  useEffect(() => {
    if (connected) {
      loadOrders();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await fetchAllOrders();
      setOrders(allOrders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderPda) => {
    if (!connected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setProcessing(orderPda.toString());
      const tx = await acceptOrder(orderPda);
      alert(`✅ Order accepted!\n\nTransaction: ${tx}\n\nYou can now wait for the seller to deposit crypto into escrow.`);
      await loadOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const formatAmount = (amount, decimals = 9) => {
    return (amount.toNumber() / 10 ** decimals).toFixed(4);
  };

  const formatMxn = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount.toNumber() / 1_000_000);
  };

  const getTokenSymbol = (tokenType) => {
    if (tokenType.sol) return 'SOL';
    if (tokenType.usdc) return 'USDC';
    if (tokenType.usdt) return 'USDT';
    return 'Unknown';
  };

  const getPaymentMethod = (paymentMethod) => {
    if (paymentMethod.stp) return 'STP';
    if (paymentMethod.spei) return 'SPEI';
    if (paymentMethod.cash) return 'Cash';
    return 'Unknown';
  };

  const getStatusBadge = (status) => {
    if (status.open) return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Open</span>;
    if (status.accepted) return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Accepted</span>;
    if (status.funded) return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Funded</span>;
    if (status.paymentConfirmed) return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Payment Confirmed</span>;
    if (status.completed) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Completed</span>;
    if (status.disputed) return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Disputed</span>;
    if (status.cancelled) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Cancelled</span>;
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
  };

  const calculateRate = (cryptoAmount, mxnAmount) => {
    return (mxnAmount / cryptoAmount).toFixed(2);
  };

  const filterOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'open') return orders.filter(o => o.account.status.open);
    if (filter === 'my') return orders.filter(o =>
      publicKey && (
        o.account.seller.toString() === publicKey.toString() ||
        (o.account.buyer && o.account.buyer.toString() === publicKey.toString())
      )
    );
    return orders;
  };

  const filteredOrders = filterOrders();

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your Solana wallet to view the marketplace
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Book</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'open'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'my'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            My Orders
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 mt-2">Be the first to create one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Seller
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Price (MXN)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const token = getTokenSymbol(order.account.tokenType);
                const decimals = token === 'SOL' ? 9 : 6;
                const amount = parseFloat(formatAmount(order.account.amount, decimals));
                const mxnAmount = order.account.amountMxn.toNumber() / 1_000_000;
                const rate = calculateRate(amount, mxnAmount);
                const isMyOrder = publicKey && order.account.seller.toString() === publicKey.toString();
                const isProcessing = processing === order.publicKey.toString();

                return (
                  <tr
                    key={order.publicKey.toString()}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <code className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">
                        {order.account.orderId}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(order.account.status)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-600 font-mono">
                        {order.account.seller.toString().slice(0, 4)}...
                        {order.account.seller.toString().slice(-4)}
                      </span>
                      {isMyOrder && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-gray-900">
                        {amount} <span className="text-purple-600">{token}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        ${rate} MXN/{token}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-green-600 text-lg">
                        {formatMxn(order.account.amountMxn)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getPaymentMethod(order.account.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {order.account.status.open && !isMyOrder ? (
                        <button
                          onClick={() => handleAcceptOrder(order.publicKey)}
                          disabled={isProcessing}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isProcessing
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {isProcessing ? '⏳ Processing...' : '💰 Buy Crypto'}
                        </button>
                      ) : isMyOrder ? (
                        <span className="text-xs text-gray-500">Your order</span>
                      ) : (
                        <span className="text-xs text-gray-400">Not available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
