import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import PropTypes from 'prop-types';
import { useP2PProgram } from '../../hooks/useP2PProgram';
import { useCivicPass } from '../../hooks/useCivicPass';
import { TOKEN_TYPES } from '../../utils/constants';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

/**
 * OrderCard Component
 * Displays a single order with action buttons based on user role and order status
 */
export default function OrderCard({ order, isMyOrder, onRefresh }) {
  const { publicKey } = useWallet();
  const { program, getUserProfilePDA, getEscrowPDA } = useP2PProgram();
  const { isValid: kycValid } = useCivicPass();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'accepted':
        return 'info';
      case 'funded':
        return 'warning';
      case 'paymentconfirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'disputed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Abierta',
      accepted: 'Aceptada',
      funded: 'Fondeada',
      paymentconfirmed: 'Pago Confirmado',
      completed: 'Completada',
      cancelled: 'Cancelada',
      disputed: 'En Disputa',
    };
    return labels[status] || status;
  };

  // Accept Order (Buyer)
  const handleAcceptOrder = async () => {
    if (!kycValid) {
      setError('Debes completar la verificación KYC para aceptar órdenes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const buyerProfilePDA = getUserProfilePDA(publicKey);

      const tx = await program.methods
        .acceptOrder()
        .accounts({
          order: order.publicKey,
          buyerProfile: buyerProfilePDA,
          buyer: publicKey,
        })
        .rpc();

      console.log('Order accepted! Tx:', tx);
      setSuccess('¡Orden aceptada! El vendedor debe depositar los fondos en escrow.');

      setTimeout(() => {
        setSuccess(null);
        onRefresh?.();
      }, 3000);
    } catch (err) {
      console.error('Error accepting order:', err);
      setError(err.message || 'Error al aceptar la orden');
    } finally {
      setLoading(false);
    }
  };

  // Deposit to Escrow (Seller - after order accepted)
  const handleDepositToEscrow = async () => {
    setLoading(true);
    setError(null);

    try {
      const escrowPDA = getEscrowPDA(order.publicKey);
      const tokenDecimals = TOKEN_TYPES[order.tokenType]?.decimals || 9;
      const amount = new BN(Math.floor(parseFloat(order.amount) * Math.pow(10, tokenDecimals)));

      if (order.tokenType === 'SOL') {
        // Deposit SOL
        const tx = await program.methods
          .depositToEscrowNative()
          .accounts({
            order: order.publicKey,
            escrow: escrowPDA,
            seller: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('SOL deposited to escrow! Tx:', tx);
      } else {
        // TODO: Implement SPL token deposit
        setError('Depósito de tokens SPL aún no implementado en el frontend');
        setLoading(false);
        return;
      }

      setSuccess('¡Fondos depositados en escrow! El comprador puede proceder con el pago.');

      setTimeout(() => {
        setSuccess(null);
        onRefresh?.();
      }, 3000);
    } catch (err) {
      console.error('Error depositing to escrow:', err);
      setError(err.message || 'Error al depositar fondos');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Fiat Payment (Buyer - after seller deposits)
  const handleConfirmPayment = async () => {
    const stpTxId = prompt('Ingresa el ID de transacción STP:');
    if (!stpTxId) return;

    setLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .confirmFiatPayment(stpTxId)
        .accounts({
          order: order.publicKey,
          buyer: publicKey,
        })
        .rpc();

      console.log('Payment confirmed! Tx:', tx);
      setSuccess('¡Pago confirmado! Esperando liberación de fondos por el oráculo.');

      setTimeout(() => {
        setSuccess(null);
        onRefresh?.();
      }, 3000);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.message || 'Error al confirmar el pago');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Order (Seller - only if not accepted)
  const handleCancelOrder = async () => {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return;

    setLoading(true);
    setError(null);

    try {
      const escrowPDA = getEscrowPDA(order.publicKey);

      if (order.tokenType === 'SOL') {
        const tx = await program.methods
          .cancelOrderNative()
          .accounts({
            order: order.publicKey,
            escrow: escrowPDA,
            seller: publicKey,
          })
          .rpc();

        console.log('Order cancelled! Tx:', tx);
      } else {
        setError('Cancelación de órdenes SPL aún no implementada');
        setLoading(false);
        return;
      }

      setSuccess('Orden cancelada exitosamente');

      setTimeout(() => {
        setSuccess(null);
        onRefresh?.();
      }, 2000);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Error al cancelar la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
            <span className="text-sm text-gray-500">#{order.orderId.slice(-8)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Creada: {order.createdAt.toLocaleDateString('es-MX')} {order.createdAt.toLocaleTimeString('es-MX')}
          </div>
        </div>
        {isMyOrder && (
          <Badge variant="info">Mi Orden</Badge>
        )}
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Criptomoneda</div>
          <div className="text-lg font-bold">{order.amount} {order.tokenType}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Monto MXN</div>
          <div className="text-lg font-bold">{order.amountMXN}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Método de Pago</div>
          <div className="text-lg font-bold">{order.paymentMethod}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Referencia STP</div>
          <div className="text-lg font-bold truncate">{order.stpReference}</div>
        </div>
      </div>

      {/* Seller/Buyer Info */}
      <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Vendedor:</span>{' '}
            <span className="font-mono">{order.seller.toString().slice(0, 8)}...</span>
          </div>
          {order.buyer && (
            <div>
              <span className="text-gray-500">Comprador:</span>{' '}
              <span className="font-mono">{order.buyer.toString().slice(0, 8)}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert type="success" className="mb-4">
          {success}
        </Alert>
      )}

      {/* Action Buttons */}
      {publicKey && (
        <div className="flex flex-wrap gap-2">
          {/* Buyer Actions */}
          {!isMyOrder && order.status === 'open' && (
            <Button
              onClick={handleAcceptOrder}
              variant="primary"
              disabled={loading || !kycValid}
            >
              {loading ? <Spinner size="sm" /> : 'Aceptar Orden'}
            </Button>
          )}

          {!isMyOrder && order.status === 'funded' && order.buyer?.toString() === publicKey.toString() && (
            <Button
              onClick={handleConfirmPayment}
              variant="primary"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Confirmar Pago Enviado'}
            </Button>
          )}

          {/* Seller Actions */}
          {isMyOrder && order.status === 'accepted' && (
            <Button
              onClick={handleDepositToEscrow}
              variant="primary"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Depositar en Escrow'}
            </Button>
          )}

          {isMyOrder && order.status === 'open' && (
            <Button
              onClick={handleCancelOrder}
              variant="error"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Cancelar Orden'}
            </Button>
          )}

          {/* View Details Button */}
          <Button
            variant="secondary"
            onClick={() => window.open(`https://explorer.solana.com/address/${order.publicKey.toString()}?cluster=devnet`, '_blank')}
          >
            Ver en Explorer
          </Button>
        </div>
      )}

      {!publicKey && (
        <Alert type="info">
          Conecta tu wallet para interactuar con esta orden
        </Alert>
      )}
    </div>
  );
}

OrderCard.propTypes = {
  order: PropTypes.shape({
    publicKey: PropTypes.object.isRequired,
    orderId: PropTypes.string.isRequired,
    seller: PropTypes.object.isRequired,
    buyer: PropTypes.object,
    amount: PropTypes.string.isRequired,
    amountMXN: PropTypes.string.isRequired,
    tokenType: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    stpReference: PropTypes.string.isRequired,
    createdAt: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
  isMyOrder: PropTypes.bool,
  onRefresh: PropTypes.func,
};
