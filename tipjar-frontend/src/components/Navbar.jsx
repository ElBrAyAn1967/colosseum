import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

// Define el color principal morado de Solana para mayor consistencia
const SOLANA_PURPLE = '#9945FF';

// Estilos de clase de Tailwind personalizados para el botón de la billetera
// para mantener la estética oscura pero con el acento morado de Solana.
const walletButtonClass = `
  !bg-black 
  !text-white 
  !border-2 
  !border-[${SOLANA_PURPLE}] 
  hover:!bg-gray-900 
  !font-medium 
  !rounded-lg
`;

export function Navbar({ currentView, setCurrentView }) {
  const { connected } = useWallet();

  return (
    // Fondo negro sólido, sin degradado
    <nav className="bg-black shadow-lg"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Texto Principal */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white" style={{ color: SOLANA_PURPLE }}>
                {/* Usamos el morado de Solana para el título */}
                💱 Solanita P2P 
              </h1>
            </div>
            <div className="ml-4 text-sm text-gray-400"> {/* Texto secundario más discreto */}
              USA ⟷ México
            </div>
          </div>

          {/* Enlaces de Navegación (Escritorio) */}
          {connected && (
            <div className="hidden md:flex items-center space-x-4">
              {['marketplace', 'myOrders', 'createOrder', 'profile'].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      currentView === view
                        ? `bg-black text-white border-2 border-[${SOLANA_PURPLE}]` // Borde morado para el activo
                        : 'text-gray-300 hover:text-white hover:bg-gray-800' // Botón oscuro, texto claro al pasar el ratón
                    }
                  `}
                  // Usamos un estilo en línea para el texto activo para asegurar el color morado de Solana
                  style={currentView === view ? { color: SOLANA_PURPLE } : {}}
                >
                  {view === 'marketplace' && '🛒 Marketplace'}
                  {view === 'myOrders' && '📋 My Orders'}
                  {view === 'createOrder' && '➕ Create Order'}
                  {view === 'profile' && '👤 Profile'}
                </button>
              ))}
            </div>
          )}

          {/* Botón de la Billetera */}
          <div className="flex items-center">
            {/* Se aplica la clase personalizada de estilo Solana/Oscuro */}
            <WalletMultiButton className={walletButtonClass} />
          </div>
        </div>

        {/* Navegación Móvil */}
        {connected && (
          <div className="md:hidden pb-3">
            <div className="flex space-x-2 overflow-x-auto">
              {['marketplace', 'myOrders', 'createOrder', 'profile'].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`
                    px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-colors
                    ${
                      currentView === view
                        ? `bg-black text-white border-2 border-[${SOLANA_PURPLE}]` // Borde morado para el activo
                        : 'text-gray-300 bg-gray-900' // Fondo gris oscuro para los inactivos
                    }
                  `}
                  // Usamos un estilo en línea para el texto activo para asegurar el color morado de Solana
                  style={currentView === view ? { color: SOLANA_PURPLE } : {}}
                >
                  {view === 'marketplace' && '🛒 Marketplace'}
                  {view === 'myOrders' && '📋 Orders'}
                  {view === 'createOrder' && '➕ Create'}
                  {view === 'profile' && '👤 Profile'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}