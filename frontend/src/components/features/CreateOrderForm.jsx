import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useP2PProgram } from '../../hooks/useP2PProgram';
import { useCivicPass } from '../../hooks/useCivicPass';
import { getPriceByTokenType, convertFromMXN } from '../../services/priceOracle';
import { MAX_ORDER_AMOUNT_MXN, TOKEN_TYPES, PAYMENT_METHODS } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import KycBadge from '../common/KycBadge';

/**
 * CreateOrderForm Component
 * Form to create a new P2P sell order with real-time price calculation
 */
export default function CreateOrderForm() {
  const { publicKey } = useWallet();
  const { program, getUserProfilePDA, getOrderPDA, getEscrowPDA } = useP2PProgram();
  const { isValid: kycValid, loading: kycLoading } = useCivicPass();

  const [formData, setFormData] = useState({
    amountMXN: '',
    tokenType: 'SOL',
    paymentMethod: 'STP',
    stpReference: '',
  });

  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calculate crypto amount when MXN amount or token type changes
  useEffect(() => {
    calculateCryptoAmount();
  }, [formData.amountMXN, formData.tokenType]);

  const calculateCryptoAmount = async () => {
    if (!formData.amountMXN || parseFloat(formData.amountMXN) <= 0) {
      setCryptoAmount(0);
      setCurrentPrice(0);
      return;
    }

    setCalculating(true);
    try {
      const price = await getPriceByTokenType(formData.tokenType);
      setCurrentPrice(price);

      const mxnAmount = parseFloat(formData.amountMXN);
      const crypto = await convertFromMXN(mxnAmount, formData.tokenType);
      setCryptoAmount(crypto);
    } catch (err) {
      console.error('Error calculating crypto amount:', err);
      setError('Error al calcular el precio');
    } finally {
      setCalculating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!publicKey) {
      setError('Por favor conecta tu wallet');
      return false;
    }

    if (!kycValid) {
      setError('Debes completar la verificación KYC para crear órdenes');
      return false;
    }

    const mxnAmount = parseFloat(formData.amountMXN);
    if (!mxnAmount || mxnAmount <= 0) {
      setError('Ingresa un monto válido en MXN');
      return false;
    }

    if (mxnAmount > MAX_ORDER_AMOUNT_MXN) {
      setError(`El monto máximo permitido es ${MAX_ORDER_AMOUNT_MXN.toLocaleString()} MXN`);
      return false;
    }

    if (!formData.stpReference || formData.stpReference.length < 3) {
      setError('Ingresa una referencia STP válida');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Generate unique order ID
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get PDAs
      const orderPDA = getOrderPDA(orderId);
      const escrowPDA = getEscrowPDA(orderPDA);
      const sellerProfilePDA = getUserProfilePDA(publicKey);

      // Convert amounts to proper format
      const tokenDecimals = TOKEN_TYPES[formData.tokenType].decimals;
      const amount = new BN(Math.floor(cryptoAmount * Math.pow(10, tokenDecimals)));
      const amountMxn = new BN(Math.floor(parseFloat(formData.amountMXN) * 1_000_000)); // 6 decimals for MXN

      // Convert token type string to enum variant
      const tokenType = { [formData.tokenType.toLowerCase()]: {} };
      const paymentMethod = { [formData.paymentMethod.toLowerCase()]: {} };

      // Create order transaction
      const tx = await program.methods
        .createOrder(
          orderId,
          amount,
          amountMxn,
          tokenType,
          paymentMethod,
          formData.stpReference
        )
        .accounts({
          order: orderPDA,
          escrow: escrowPDA,
          sellerProfile: sellerProfilePDA,
          seller: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Order created! Transaction signature:', tx);

      setSuccess(true);
      setFormData({
        amountMXN: '',
        tokenType: 'SOL',
        paymentMethod: 'STP',
        stpReference: '',
      });
      setCryptoAmount(0);

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Crear Orden de Venta</h2>
        <KycBadge showVerifyButton={false} />
      </div>

      {kycLoading && (
        <Alert type="info">Verificando estado de KYC...</Alert>
      )}

      {!kycLoading && !kycValid && (
        <Alert type="warning" className="mb-4">
          Debes completar la verificación KYC antes de crear órdenes.
          <KycBadge showVerifyButton={true} className="mt-2" />
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo de Criptomoneda
          </label>
          <select
            name="tokenType"
            value={formData.tokenType}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          >
            <option value="SOL">Solana (SOL)</option>
            <option value="USDC">USD Coin (USDC)</option>
            <option value="USDT">Tether (USDT)</option>
          </select>
        </div>

        {/* MXN Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Monto en MXN (máx. {MAX_ORDER_AMOUNT_MXN.toLocaleString()})
          </label>
          <Input
            type="number"
            name="amountMXN"
            value={formData.amountMXN}
            onChange={handleInputChange}
            placeholder="0.00"
            min="1"
            max={MAX_ORDER_AMOUNT_MXN}
            step="0.01"
            disabled={loading}
            required
          />
        </div>

        {/* Crypto Amount Display */}
        {formData.amountMXN && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bgDark3)' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Recibirás</span>
              {calculating ? (
                <Spinner size="sm" />
              ) : (
                <span className="text-2xl font-bold">
                  {cryptoAmount.toFixed(TOKEN_TYPES[formData.tokenType].decimals)} {formData.tokenType}
                </span>
              )}
            </div>
            {currentPrice > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                Precio actual: 1 {formData.tokenType} = ${currentPrice.toFixed(2)} MXN
              </div>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Método de Pago
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          >
            {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* STP Reference */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Referencia STP/SPEI
          </label>
          <Input
            type="text"
            name="stpReference"
            value={formData.stpReference}
            onChange={handleInputChange}
            placeholder="Ingresa tu referencia de pago"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta referencia será usada por el comprador para enviarte el pago en MXN
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error">{error}</Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert type="success">
            ¡Orden creada exitosamente! Ahora debes depositar los fondos en el escrow.
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading || calculating || !kycValid}
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Creando orden...</span>
            </>
          ) : (
            'Crear Orden'
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Al crear una orden, aceptas los términos y condiciones de la plataforma.
          Se cobrará una comisión del 0.5% al completar la transacción.
        </p>
      </form>
    </div>
  );
}
