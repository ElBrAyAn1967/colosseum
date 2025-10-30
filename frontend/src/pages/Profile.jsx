import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useP2PProgram } from '../hooks/useP2PProgram';
import { useCivicPass } from '../hooks/useCivicPass';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import KycBadge from '../components/common/KycBadge';
import Spinner from '../components/common/Spinner';
import { truncateAddress } from '../utils/helpers';

export default function Profile() {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const { fetchUserProfile } = useP2PProgram();
  const { hasPass, status: kycStatus, isValid: kycValid, statusMessage } = useCivicPass();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile();
    }
  }, [connected, publicKey]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await fetchUserProfile(publicKey);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mi Perfil</h1>

      {loading ? (
        <div className="card p-12 text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p>Cargando perfil...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="card p-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {publicKey?.toString().slice(0, 2).toUpperCase()}
                </div>

                <h2 className="text-xl font-bold mb-2">
                  {truncateAddress(publicKey?.toString() || '')}
                </h2>

                <div className="mb-4">
                  <KycBadge showVerifyButton={false} />
                </div>

                {userProfile && (
                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                    <div className="text-sm text-gray-500">Miembro desde</div>
                    <div className="font-semibold">
                      {new Date(userProfile.createdAt * 1000).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                )}

                {!userProfile && (
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/marketplace?view=setup')}
                      className="w-full"
                    >
                      Crear Perfil
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats */}
            {userProfile ? (
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Operaciones</div>
                    <div className="text-2xl font-bold">
                      {userProfile.totalTrades?.toString() || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Exitosas</div>
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
            ) : (
              <div className="card p-6 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">No tienes un perfil</h3>
                <p className="text-gray-500 mb-4">
                  Crea tu perfil para empezar a operar en la plataforma
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/marketplace?view=setup')}
                >
                  Crear Perfil Ahora
                </Button>
              </div>
            )}

            {/* KYC Status */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Estado de Verificación KYC</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">Nivel de Verificación</div>
                  <KycBadge showVerifyButton={false} />
                  <p className="text-sm text-gray-500 mt-2">{statusMessage}</p>
                </div>
                {!kycValid && (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/marketplace?view=setup')}
                  >
                    Completar KYC
                  </Button>
                )}
              </div>

              <div className="mt-6 p-4 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                <h4 className="font-bold mb-2">¿Por qué necesito KYC?</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>✓ Requerido por regulaciones mexicanas</li>
                  <li>✓ Protección contra fraude</li>
                  <li>✓ Aumenta la confianza en la plataforma</li>
                  <li>✓ Necesario para transacciones P2P</li>
                </ul>
              </div>
            </div>

            {/* Account Info */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Información de Cuenta</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                  <span className="text-gray-500">Wallet Address</span>
                  <span className="font-mono text-sm">{truncateAddress(publicKey?.toString() || '')}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                  <span className="text-gray-500">Estado</span>
                  <Badge variant={userProfile?.isActive ? 'success' : 'error'}>
                    {userProfile?.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                  <span className="text-gray-500">KYC Verificado</span>
                  <Badge variant={userProfile?.kycVerified ? 'success' : 'warning'}>
                    {userProfile?.kycVerified ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  onClick={() => navigate('/marketplace')}
                >
                  📊 Ir al Marketplace
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  📈 Ver Dashboard
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=devnet`, '_blank')}
                >
                  🔍 Ver en Explorer
                </Button>
                {userProfile && (
                  <Button
                    variant="secondary"
                    onClick={loadProfile}
                  >
                    🔄 Actualizar Datos
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
