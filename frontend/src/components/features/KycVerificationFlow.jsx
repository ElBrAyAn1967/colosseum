import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import { useP2PProgram } from '../../hooks/useP2PProgram';
import { useCivicPass } from '../../hooks/useCivicPass';
import Button from '../common/Button';
import KycBadge from '../common/KycBadge';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';

/**
 * KycVerificationFlow Component
 * Guides users through the KYC verification process and creates their user profile
 */
export default function KycVerificationFlow() {
  const { publicKey } = useWallet();
  const { program, getUserProfilePDA, fetchUserProfile } = useP2PProgram();
  const {
    loading: kycLoading,
    hasPass,
    isValid: kycValid,
    statusMessage,
    isVerifying,
    startVerification,
  } = useCivicPass();

  const [currentStep, setCurrentStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Verificación KYC con Civic',
      description: 'Completa tu verificación de identidad usando Civic Pass',
      action: 'Verificar Identidad',
    },
    {
      number: 2,
      title: 'Crear Perfil de Usuario',
      description: 'Crea tu perfil en la plataforma TipJar P2P',
      action: 'Crear Perfil',
    },
    {
      number: 3,
      title: '¡Listo para Operar!',
      description: 'Tu cuenta está configurada y puedes empezar a crear y aceptar órdenes',
      action: null,
    },
  ];

  const handleStartKyc = async () => {
    try {
      setError(null);
      await startVerification();
      setCurrentStep(2);
    } catch (err) {
      console.error('Error starting KYC:', err);
      setError('Error al iniciar la verificación KYC');
    }
  };

  const handleCreateProfile = async () => {
    if (!publicKey) {
      setError('Por favor conecta tu wallet');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Check if profile already exists
      const existingProfile = await fetchUserProfile(publicKey);
      if (existingProfile) {
        setSuccess(true);
        setCurrentStep(3);
        setCreating(false);
        return;
      }

      const userProfilePDA = getUserProfilePDA(publicKey);

      // For now, we'll create profile with KYC verified = true
      // In production, this should check Civic Pass status
      const tx = await program.methods
        .createUserProfile(
          true, // kyc_verified - should check Civic Pass in production
          null  // kyc_nft_mint - optional Civic Pass NFT reference
        )
        .accounts({
          userProfile: userProfilePDA,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('User profile created! Tx:', tx);
      setSuccess(true);
      setCurrentStep(3);
    } catch (err) {
      console.error('Error creating user profile:', err);
      setError(err.message || 'Error al crear el perfil de usuario');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Configuración de Cuenta</h1>
        <p className="text-lg text-gray-500">
          Completa estos pasos para empezar a operar en TipJar P2P
        </p>
      </div>

      {/* Current KYC Status */}
      <div className="card p-6 text-center">
        <h3 className="text-lg font-bold mb-4">Estado de Verificación</h3>
        <KycBadge showVerifyButton={false} className="justify-center" />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLocked = currentStep < step.number;

          return (
            <div
              key={step.number}
              className={`card p-6 transition-all ${
                isActive ? 'ring-2 ring-primary' : ''
              } ${isLocked ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Step Number */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-500 mb-4">{step.description}</p>

                  {/* Step 1: KYC Verification */}
                  {step.number === 1 && isActive && (
                    <div className="space-y-4">
                      {kycLoading && (
                        <div className="flex items-center gap-2">
                          <Spinner size="sm" />
                          <span>Verificando estado...</span>
                        </div>
                      )}

                      {!kycLoading && !kycValid && (
                        <Button
                          onClick={handleStartKyc}
                          variant="primary"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Spinner size="sm" />
                              <span>Verificando...</span>
                            </>
                          ) : (
                            step.action
                          )}
                        </Button>
                      )}

                      {!kycLoading && kycValid && (
                        <div>
                          <Alert type="success" className="mb-4">
                            ¡Verificación KYC completada!
                          </Alert>
                          <Button onClick={() => setCurrentStep(2)} variant="primary">
                            Continuar al Siguiente Paso
                          </Button>
                        </div>
                      )}

                      <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                        <h4 className="font-bold mb-2">¿Qué es Civic Pass?</h4>
                        <p className="text-sm text-gray-500">
                          Civic Pass es un sistema de verificación de identidad en blockchain
                          que te permite demostrar tu identidad sin compartir información personal.
                          Es requerido por regulaciones mexicanas para transacciones P2P.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Create Profile */}
                  {step.number === 2 && isActive && (
                    <div className="space-y-4">
                      {error && <Alert type="error">{error}</Alert>}

                      {!kycValid ? (
                        <Alert type="warning">
                          Primero debes completar la verificación KYC en el paso anterior.
                        </Alert>
                      ) : (
                        <>
                          <Button
                            onClick={handleCreateProfile}
                            variant="primary"
                            disabled={creating}
                          >
                            {creating ? (
                              <>
                                <Spinner size="sm" />
                                <span>Creando perfil...</span>
                              </>
                            ) : (
                              step.action
                            )}
                          </Button>

                          <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'var(--bgDark3)' }}>
                            <h4 className="font-bold mb-2">Tu Perfil TipJar</h4>
                            <p className="text-sm text-gray-500 mb-2">
                              Tu perfil de usuario almacena:
                            </p>
                            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                              <li>Estado de verificación KYC</li>
                              <li>Historial de transacciones exitosas</li>
                              <li>Reputación como comprador/vendedor</li>
                              <li>Disputas resueltas</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 3: Ready */}
                  {step.number === 3 && isActive && success && (
                    <div className="space-y-4">
                      <Alert type="success">
                        ¡Tu cuenta está completamente configurada!
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="primary"
                          onClick={() => (window.location.href = '/marketplace')}
                        >
                          Ver Marketplace
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => (window.location.href = '/dashboard')}
                        >
                          Ir a Mi Dashboard
                        </Button>
                      </div>

                      <div className="mt-4 p-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <h4 className="font-bold mb-2">🎉 ¡Bienvenido a TipJar P2P!</h4>
                        <p className="text-sm">
                          Ahora puedes crear órdenes de venta de crypto por MXN o
                          comprar crypto de otros usuarios de forma segura y descentralizada.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">¿Necesitas Ayuda?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-bold mb-2">📖 Documentación</h4>
            <p className="text-gray-500">
              Lee nuestra guía completa sobre cómo usar la plataforma
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">💬 Soporte</h4>
            <p className="text-gray-500">
              Contacta a nuestro equipo si tienes problemas
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">🔒 Seguridad</h4>
            <p className="text-gray-500">
              Aprende sobre nuestras medidas de seguridad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
