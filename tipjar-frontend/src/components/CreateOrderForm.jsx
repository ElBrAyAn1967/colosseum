import React, { useState } from 'react';
import { useP2PProgram } from '../hooks/useP2PProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function CreateOrderForm() {
  const { createOrder, connected, checkUserProfile } = useP2PProgram();
  const { publicKey } = useWallet();

  const [formData, setFormData] = useState({
    tokenType: 'SOL',
    amount: '',
    amountMxn: '',
    paymentMethod: 'STP',
    stpReference: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const calculateRate = () => {
    if (formData.amount && formData.amountMxn) {
      const rate = parseFloat(formData.amountMxn) / parseFloat(formData.amount);
      return rate.toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.amountMxn || parseFloat(formData.amountMxn) <= 0) {
      setError('Please enter a valid MXN amount');
      return;
    }

    if (parseFloat(formData.amountMxn) > 9000) {
      setError('Maximum amount is 9,000 MXN per transaction');
      return;
    }

    if (!formData.stpReference.trim()) {
      setError('Please enter an STP reference');
      return;
    }

    try {
      setLoading(true);

      // Verificar que el usuario tenga perfil
      const profile = await checkUserProfile();
      if (!profile) {
        setError('You need to create a user profile first. Go to Profile section.');
        return;
      }

      if (!profile.kycVerified) {
        setError('You need KYC verification to create orders');
        return;
      }

      // Generar ID único para la orden
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Convertir montos
      const decimals = formData.tokenType === 'SOL' ? 9 : 6;
      const amount = Math.floor(parseFloat(formData.amount) * 10 ** decimals);
      const amountMxn = Math.floor(parseFloat(formData.amountMxn) * 1_000_000); // 6 decimales

      const result = await createOrder(
        orderId,
        amount,
        amountMxn,
        formData.tokenType,
        formData.paymentMethod,
        formData.stpReference
      );

      setSuccess(`✅ Order created successfully!\n\nOrder ID: ${orderId}\nTransaction: ${result.tx}\n\nNext step: Deposit crypto to escrow when buyer accepts.`);

      // Limpiar formulario
      setFormData({
        tokenType: 'SOL',
        amount: '',
        amountMxn: '',
        paymentMethod: 'STP',
        stpReference: '',
      });

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your Solana wallet to create orders
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Sell Order</h2>
        <p className="text-sm text-gray-600 mt-1">
          Create an order to sell crypto for MXN
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token to Sell
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['SOL', 'USDC', 'USDT'].map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tokenType: token }))}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  formData.tokenType === token
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({formData.tokenType})
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.000001"
            min="0"
            placeholder={`0.00 ${formData.tokenType}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* Amount MXN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price in MXN (Max: 9,000 MXN)
          </label>
          <input
            type="number"
            name="amountMxn"
            value={formData.amountMxn}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="9000"
            placeholder="0.00 MXN"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          {parseFloat(formData.amountMxn) > 9000 && (
            <p className="text-red-500 text-sm mt-1">
              ⚠️ Maximum amount is 9,000 MXN
            </p>
          )}
        </div>

        {/* Exchange Rate Display */}
        {formData.amount && formData.amountMxn && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-900">
                Exchange Rate:
              </span>
              <span className="text-lg font-bold text-purple-600">
                {calculateRate()} MXN/{formData.tokenType}
              </span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['STP', 'SPEI', 'Cash'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  formData.paymentMethod === method
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* STP Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            STP Reference
          </label>
          <input
            type="text"
            name="stpReference"
            value={formData.stpReference}
            onChange={handleChange}
            placeholder="STP_REF_123456"
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This reference will be used to track the fiat payment
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="text-sm whitespace-pre-line">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
          }`}
        >
          {loading ? '⏳ Creating Order...' : '🚀 Create Sell Order'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 How it works:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Create your sell order with your desired rate</li>
          <li>Wait for a buyer to accept your order</li>
          <li>Deposit crypto to escrow (secure)</li>
          <li>Buyer sends MXN to your bank account</li>
          <li>Oracle verifies payment and releases crypto to buyer</li>
          <li>You receive MXN! ✅</li>
        </ol>
      </div>
    </div>
  );
}
