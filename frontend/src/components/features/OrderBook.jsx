import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useP2PProgram } from '../../hooks/useP2PProgram';
import { TOKEN_TYPES } from '../../utils/constants';
import OrderCard from './OrderCard';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

/**
 * OrderBook Component
 * Displays all open P2P orders from the Solana program
 */
export default function OrderBook() {
  const { publicKey } = useWallet();
  const { program, fetchAllOrders } = useP2PProgram();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tokenType: 'ALL',
    sortBy: 'newest',
    showMyOrders: false,
  });

  // Fetch orders on mount and when program changes
  useEffect(() => {
    if (program) {
      loadOrders();

      // Refresh orders every 15 seconds
      const interval = setInterval(loadOrders, 15000);
      return () => clearInterval(interval);
    }
  }, [program]);

  // Apply filters when orders or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const loadOrders = async () => {
    try {
      setError(null);
      const allOrders = await fetchAllOrders();

      // Filter only open orders
      const openOrders = allOrders.filter(order =>
        order.status?.open !== undefined
      );

      setOrders(openOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar las órdenes');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Filter by token type
    if (filters.tokenType !== 'ALL') {
      filtered = filtered.filter(order => {
        const tokenType = Object.keys(order.tokenType)[0].toUpperCase();
        return tokenType === filters.tokenType;
      });
    }

    // Filter my orders
    if (filters.showMyOrders && publicKey) {
      filtered = filtered.filter(
        order => order.seller.toString() === publicKey.toString()
      );
    }

    // Sort orders
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'amount_high':
        filtered.sort((a, b) => b.amountMxn - a.amountMxn);
        break;
      case 'amount_low':
        filtered.sort((a, b) => a.amountMxn - b.amountMxn);
        break;
      default:
        break;
    }

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const formatTokenAmount = (amount, tokenType) => {
    const decimals = TOKEN_TYPES[tokenType]?.decimals || 9;
    const formatted = amount / Math.pow(10, decimals);
    return formatted.toFixed(decimals);
  };

  const formatMXN = (amountMxn) => {
    const mxn = amountMxn / 1_000_000; // Convert from 6 decimals
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(mxn);
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p>Cargando órdenes del programa Solana...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Token Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Criptomoneda
            </label>
            <select
              name="tokenType"
              value={filters.tokenType}
              onChange={handleFilterChange}
              className="input w-full"
            >
              <option value="ALL">Todas</option>
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ordenar por
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="input w-full"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="amount_high">Mayor monto</option>
              <option value="amount_low">Menor monto</option>
            </select>
          </div>

          {/* Show My Orders */}
          {publicKey && (
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showMyOrders"
                  checked={filters.showMyOrders}
                  onChange={handleFilterChange}
                  className="w-4 h-4"
                />
                <span className="text-sm">Solo mis órdenes</span>
              </label>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={loadOrders}
              className="btn-secondary w-full"
              disabled={loading}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error">
          {error}
          <button onClick={loadOrders} className="btn-secondary ml-4">
            Reintentar
          </button>
        </Alert>
      )}

      {/* Orders Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total de Órdenes</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Órdenes Filtradas</div>
          <div className="text-2xl font-bold">{filteredOrders.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Mis Órdenes</div>
          <div className="text-2xl font-bold">
            {publicKey
              ? orders.filter(o => o.seller.toString() === publicKey.toString()).length
              : 0}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">No hay órdenes disponibles</h3>
          <p className="text-gray-500">
            {filters.showMyOrders
              ? 'No tienes órdenes creadas'
              : 'No hay órdenes abiertas en este momento'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const tokenType = Object.keys(order.tokenType)[0].toUpperCase();
            const paymentMethod = Object.keys(order.paymentMethod)[0].toUpperCase();

            return (
              <OrderCard
                key={order.publicKey.toString()}
                order={{
                  publicKey: order.publicKey,
                  orderId: order.orderId,
                  seller: order.seller,
                  buyer: order.buyer,
                  amount: formatTokenAmount(order.amount, tokenType),
                  amountMXN: formatMXN(order.amountMxn),
                  tokenType,
                  paymentMethod,
                  status: Object.keys(order.status)[0],
                  stpReference: order.stpReference,
                  createdAt: new Date(order.createdAt * 1000),
                }}
                isMyOrder={publicKey?.toString() === order.seller.toString()}
                onRefresh={loadOrders}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
