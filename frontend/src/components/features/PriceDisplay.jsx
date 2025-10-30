import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTokenPrices } from '../../services/priceOracle';
import Spinner from '../common/Spinner';

/**
 * PriceDisplay Component
 * Shows real-time crypto prices in MXN from CoinGecko API
 */
export default function PriceDisplay({ className = '' }) {
  const [prices, setPrices] = useState({
    solana: { mxn: 0, mxn_24h_change: 0 },
    'usd-coin': { mxn: 0, mxn_24h_change: 0 },
    tether: { mxn: 0, mxn_24h_change: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch prices on mount and every 30 seconds
  useEffect(() => {
    fetchPrices();

    const interval = setInterval(() => {
      fetchPrices();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      setError(null);
      const pricesData = await getTokenPrices();
      setPrices(pricesData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Error al cargar precios');
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (change) => {
    if (!change) return '0.00%';
    const formatted = change.toFixed(2);
    return `${change >= 0 ? '+' : ''}${formatted}%`;
  };

  const getChangeColor = (change) => {
    if (!change) return 'text-gray-400';
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Spinner />
          <span className="ml-3">Cargando precios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchPrices}
            className="btn-secondary mt-4"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Precios en Tiempo Real</h3>
        {lastUpdated && (
          <span className="text-sm text-gray-500">
            Actualizado: {lastUpdated.toLocaleTimeString('es-MX')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SOL Price */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bgDark3)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm text-gray-500">Solana</span>
              <h4 className="text-lg font-bold">SOL</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">◎</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatPrice(prices.solana?.mxn || 0)}
            </p>
            <p className={`text-sm ${getChangeColor(prices.solana?.mxn_24h_change)}`}>
              {formatPercentage(prices.solana?.mxn_24h_change)} 24h
            </p>
          </div>
        </div>

        {/* USDC Price */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bgDark3)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm text-gray-500">USD Coin</span>
              <h4 className="text-lg font-bold">USDC</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold">$</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatPrice(prices['usd-coin']?.mxn || 0)}
            </p>
            <p className={`text-sm ${getChangeColor(prices['usd-coin']?.mxn_24h_change)}`}>
              {formatPercentage(prices['usd-coin']?.mxn_24h_change)} 24h
            </p>
          </div>
        </div>

        {/* USDT Price */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bgDark3)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm text-gray-500">Tether</span>
              <h4 className="text-lg font-bold">USDT</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold">₮</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatPrice(prices.tether?.mxn || 0)}
            </p>
            <p className={`text-sm ${getChangeColor(prices.tether?.mxn_24h_change)}`}>
              {formatPercentage(prices.tether?.mxn_24h_change)} 24h
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ backgroundColor: 'var(--bgDark2)' }}>
        <span className="text-gray-500">
          Powered by{' '}
          <a
            href="https://coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            CoinGecko API
          </a>
        </span>
      </div>
    </div>
  );
}

PriceDisplay.propTypes = {
  className: PropTypes.string,
};
