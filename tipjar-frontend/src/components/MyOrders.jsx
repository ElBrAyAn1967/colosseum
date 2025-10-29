import React, { useEffect, useState } from 'react';
import { useP2PProgram } from '../hooks/useP2PProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const {
    fetchAllOrders,
    depositToEscrowNative,
    confirmFiatPayment,
    cancelOrderNative,
    openDispute,
    publicKey,
    connected
  } = useP2PProgram();

  useEffect(() => {
    if (connected) {
      loadMyOrders();
      const interval = setInterval(loadMyOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await fetchAllOrders();
      const myOrders = allOrders.filter(order =>
        publicKey && (
          order.account.seller.toString() === publicKey.toString() ||
          (order.account.buyer && order.account.buyer.toString() === publicKey.toString())
        )
      );
      setOrders(myOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositToEscrow = async (orderPda) => {
    try {
      setProcessing(orderPda.toString());
      const tx = await depositToEscrowNative(orderPda);
      alert(`✅ Crypto deposited to escrow!\n\nTransaction: ${tx}\n\nWait for buyer to send MXN payment.`);
      await loadMyOrders();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmPayment = async (orderPda, stpTxId) => {
    if (!stpTxId || !stpTxId.trim()) {
      alert('Please enter the STP transaction ID');
      return;
    }

    try {
      setProcessing(orderPda.toString());
      const tx = await confirmFiatPayment(orderPda, stpTxId);
      alert(`✅ Payment confirmed!\n\nTransaction: ${tx}\n\nOracle will verify and release crypto.`);
      await loadMyOrders();
      setActionModal(null);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelOrder = async (orderPda) => {
    if (!confirm('Are you sure you want to cancel this order? Funds will be returned to you.')) {
      return;
    }

    try {
      setProcessing(orderPda.toString());
      const tx = await cancelOrderNative(orderPda);
      alert(`✅ Order cancelled!\n\nTransaction: ${tx}\n\nFunds returned to your wallet.`);
      await loadMyOrders();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleOpenDispute = async (orderPda, reason, evidence) => {
    if (!reason || !reason.trim()) {
      alert('Please provide a reason for the dispute');
      return;
    }

    try {
      setProcessing(orderPda.toString());
      const tx = await openDispute(orderPda, reason, evidence || 'No evidence provided');
      alert(`✅ Dispute opened!\n\nTransaction: ${tx}\n\nAn arbitrator will review the case.`);
      await loadMyOrders();
      setActionModal(null);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const getRole = (order) => {
    if (!publicKey) return 'Unknown';
    if (order.account.seller.toString() === publicKey.toString()) return 'Seller';
    if (order.account.buyer && order.account.buyer.toString() === publicKey.toString()) return 'Buyer';
    return 'Unknown';
  };

  const getActionButtons = (order) => {
    const role = getRole(order);
    const orderPda = order.publicKey;
    const isProcessing = processing === orderPda.toString();

    // Seller actions
    if (role === 'Seller') {
      if (order.account.status.accepted) {
        return (
          <button
            onClick={() => handleDepositToEscrow(orderPda)}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {isProcessing ? 'Processing...' : '💰 Deposit to Escrow'}
          </button>
        );
      }
      if (order.account.status.funded || order.account.status.paymentConfirmed) {
        return (
          <button
            onClick={() => setActionModal({ type: 'dispute', order })}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
          >
            ⚠️ Open Dispute
          </button>
        );
      }
    }

    // Buyer actions
    if (role === 'Buyer') {
      if (order.account.status.funded) {
        return (
          <button
            onClick={() => setActionModal({ type: 'confirm', order })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            ✅ Confirm Payment
          </button>
        );
      }
      if (order.account.status.paymentConfirmed) {
        return (
          <span className="text-sm text-purple-600 font-medium">
            ⏳ Waiting for oracle verification...
          </span>
        );
      }
    }

    return null;
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

  const getStatusBadge = (status) => {
    if (status.open) return <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">📢 Open</span>;
    if (status.accepted) return <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">🤝 Accepted</span>;
    if (status.funded) return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">💰 Funded</span>;
    if (status.paymentConfirmed) return <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">✅ Payment Confirmed</span>;
    if (status.completed) return <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">✅ Completed</span>;
    if (status.disputed) return <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">⚠️ Disputed</span>;
    if (status.cancelled) return <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full font-medium">❌ Cancelled</span>;
    return <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full font-medium">Unknown</span>;
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your Solana wallet to view your orders
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
            <p className="text-sm text-gray-500 mt-1">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
          <button
            onClick={loadMyOrders}
            disabled={loading}
            className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No orders yet</p>
            <p className="text-gray-400 mt-2">Create your first order to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const token = getTokenSymbol(order.account.tokenType);
              const decimals = token === 'SOL' ? 9 : 6;
              const amount = parseFloat(formatAmount(order.account.amount, decimals));
              const role = getRole(order);

              return (
                <div
                  key={order.publicKey.toString()}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono">
                          {order.account.orderId}
                        </code>
                        {getStatusBadge(order.account.status)}
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          role === 'Seller'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {role === 'Seller' ? '📤 Selling' : '📥 Buying'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(order.account.createdAt.toNumber() * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {amount} <span className="text-purple-600">{token}</span>
                      </div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatMxn(order.account.amountMxn)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Seller:</span>
                      <p className="font-mono text-xs mt-1">
                        {order.account.seller.toString().slice(0, 20)}...
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyer:</span>
                      <p className="font-mono text-xs mt-1">
                        {order.account.buyer
                          ? `${order.account.buyer.toString().slice(0, 20)}...`
                          : 'Not accepted yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      STP Ref: <span className="font-mono">{order.account.stpReference}</span>
                    </div>
                    <div className="flex gap-2">
                      {getActionButtons(order)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Modals */}
      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {actionModal.type === 'confirm' && (
              <>
                <h3 className="text-xl font-bold mb-4">Confirm Fiat Payment</h3>
                <p className="text-gray-600 mb-4">
                  Have you sent the MXN payment to the seller?
                </p>
                <input
                  type="text"
                  placeholder="Enter STP Transaction ID"
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  id="stpTxId"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const stpTxId = document.getElementById('stpTxId').value;
                      handleConfirmPayment(actionModal.order.publicKey, stpTxId);
                    }}
                    disabled={processing}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    ✅ Confirm
                  </button>
                  <button
                    onClick={() => setActionModal(null)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {actionModal.type === 'dispute' && (
              <>
                <h3 className="text-xl font-bold mb-4">Open Dispute</h3>
                <textarea
                  placeholder="Explain the issue..."
                  className="w-full px-4 py-2 border rounded-lg mb-4 h-32"
                  id="disputeReason"
                />
                <input
                  type="text"
                  placeholder="Evidence URL (optional)"
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  id="disputeEvidence"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const reason = document.getElementById('disputeReason').value;
                      const evidence = document.getElementById('disputeEvidence').value;
                      handleOpenDispute(actionModal.order.publicKey, reason, evidence);
                    }}
                    disabled={processing}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    ⚠️ Open Dispute
                  </button>
                  <button
                    onClick={() => setActionModal(null)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
