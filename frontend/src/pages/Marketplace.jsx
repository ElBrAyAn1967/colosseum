import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import PriceDisplay from '../components/features/PriceDisplay';
import CreateOrderForm from '../components/features/CreateOrderForm';
import OrderBook from '../components/features/OrderBook';
import KycVerificationFlow from '../components/features/KycVerificationFlow';
import { useCivicPass } from '../hooks/useCivicPass';
import { useP2PProgram } from '../hooks/useP2PProgram';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

/**
 * Marketplace Page
 * Main trading interface with real-time prices, order creation, and order book
 */
export default function Marketplace() {
  const { connected, publicKey } = useWallet();
  const { fetchUserProfile } = useP2PProgram();
  const { loading: kycLoading, isValid: kycValid } = useCivicPass();

  const [view, setView] = useState('marketplace'); // 'marketplace' | 'create' | 'setup'
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load user profile when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadUserProfile();
    }
  }, [connected, publicKey]);

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const profile = await fetchUserProfile(publicKey);
      setUserProfile(profile);

      // If no profile exists, redirect to setup
      if (!profile) {
        setView('setup');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Marketplace P2P</h1>
            <p className="text-gray-500">
              Compra y vende crypto por MXN de forma segura y descentralizada
            </p>
          </div>

          <div className="flex items-center gap-4">
            {connected && (
              <>
                <Button
                  variant={view === 'marketplace' ? 'primary' : 'secondary'}
                  onClick={() => setView('marketplace')}
                >
                  📊 Marketplace
                </Button>
                <Button
                  variant={view === 'create' ? 'primary' : 'secondary'}
                  onClick={() => setView('create')}
                  disabled={!userProfile || !kycValid}
                >
                  ➕ Crear Orden
                </Button>
                <Button
                  variant={view === 'setup' ? 'primary' : 'secondary'}
                  onClick={() => setView('setup')}
                >
                  ⚙️ Configuración
                </Button>
              </>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </div>

      {/* Not Connected State */}
      {!connected && (
        <div className="space-y-6">
          {/* Price Display (available without wallet) */}
          <PriceDisplay />

          {/* Call to Action */}
          <div className="card p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🔗</div>
              <h2 className="text-3xl font-bold mb-4">
                Conecta tu Wallet para Empezar
              </h2>
              <p className="text-lg text-gray-500 mb-6">
                Para crear y aceptar órdenes P2P, necesitas conectar tu wallet de Solana.
                Soportamos Phantom, Solflare, y otras wallets compatibles.
              </p>
              <WalletMultiButton className="!mx-auto" />

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-bold mb-1">Seguro</h3>
                  <p className="text-sm text-gray-500">
                    Fondos protegidos con escrow en blockchain
                  </p>
                </div>
                <div className="p-4 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold mb-1">Rápido</h3>
                  <p className="text-sm text-gray-500">
                    Transacciones instantáneas en Solana
                  </p>
                </div>
                <div className="p-4 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-bold mb-1">Sin Intermediarios</h3>
                  <p className="text-sm text-gray-500">
                    Opera directamente con otros usuarios
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Public Order Book (Read-only) */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Órdenes Disponibles</h2>
            <OrderBook />
          </div>
        </div>
      )}

      {/* Connected - Setup View */}
      {connected && view === 'setup' && (
        <KycVerificationFlow />
      )}

      {/* Connected - No Profile Alert */}
      {connected && !profileLoading && !userProfile && view !== 'setup' && (
        <Alert type="warning" className="mb-6">
          No tienes un perfil de usuario creado.{' '}
          <button
            onClick={() => setView('setup')}
            className="underline font-bold"
          >
            Completa la configuración aquí
          </button>
        </Alert>
      )}

      {/* Connected - Marketplace View */}
      {connected && view === 'marketplace' && (
        <div className="space-y-6">
          {/* Real-time Prices */}
          <PriceDisplay />

          {/* User Stats */}
          {userProfile && (
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Tu Reputación</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total de Operaciones</div>
                  <div className="text-2xl font-bold">
                    {userProfile.totalTrades?.toString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Operaciones Exitosas</div>
                  <div className="text-2xl font-bold text-green-500">
                    {userProfile.successfulTrades?.toString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Disputas</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {userProfile.disputedTrades?.toString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tasa de Éxito</div>
                  <div className="text-2xl font-bold">
                    {userProfile.totalTrades > 0
                      ? ((userProfile.successfulTrades / userProfile.totalTrades) * 100).toFixed(1)
                      : '0'}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Book */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Libro de Órdenes</h2>
              <Button
                onClick={() => setView('create')}
                variant="primary"
                disabled={!kycValid}
              >
                ➕ Crear Nueva Orden
              </Button>
            </div>
            <OrderBook />
          </div>
        </div>
      )}

      {/* Connected - Create Order View */}
      {connected && view === 'create' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Button
            variant="secondary"
            onClick={() => setView('marketplace')}
          >
            ← Volver al Marketplace
          </Button>

          {/* Current Prices for Reference */}
          <PriceDisplay />

          {/* Create Order Form */}
          <CreateOrderForm />

          {/* Tips */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">💡 Consejos para Vender</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>✓ Verifica que tu referencia STP sea correcta</li>
              <li>✓ El precio se calcula automáticamente con CoinGecko</li>
              <li>✓ Deberás depositar los fondos en escrow después de que alguien acepte tu orden</li>
              <li>✓ Los fondos se liberan automáticamente después de confirmación de pago</li>
              <li>✓ Límite máximo: 9,000 MXN por regulación mexicana</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
