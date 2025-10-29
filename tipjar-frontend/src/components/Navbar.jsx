import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export function Navbar({ currentView, setCurrentView }) {
  const { connected } = useWallet();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">
                💱 Solanita P2P
              </h1>
            </div>
            <div className="ml-4 text-sm text-purple-200">
              USA ⟷ México
            </div>
          </div>

          {/* Navigation Links */}
          {connected && (
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('marketplace')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'marketplace'
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                🛒 Marketplace
              </button>
              <button
                onClick={() => setCurrentView('myOrders')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'myOrders'
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                📋 My Orders
              </button>
              <button
                onClick={() => setCurrentView('createOrder')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'createOrder'
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                ➕ Create Order
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'profile'
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                👤 Profile
              </button>
            </div>
          )}

          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletMultiButton className="!bg-white !text-purple-600 hover:!bg-purple-50" />
          </div>
        </div>

        {/* Mobile Navigation */}
        {connected && (
          <div className="md:hidden pb-3">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setCurrentView('marketplace')}
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                  currentView === 'marketplace'
                    ? 'bg-white text-purple-600'
                    : 'text-white bg-purple-700'
                }`}
              >
                🛒 Marketplace
              </button>
              <button
                onClick={() => setCurrentView('myOrders')}
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                  currentView === 'myOrders'
                    ? 'bg-white text-purple-600'
                    : 'text-white bg-purple-700'
                }`}
              >
                📋 Orders
              </button>
              <button
                onClick={() => setCurrentView('createOrder')}
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                  currentView === 'createOrder'
                    ? 'bg-white text-purple-600'
                    : 'text-white bg-purple-700'
                }`}
              >
                ➕ Create
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                  currentView === 'profile'
                    ? 'bg-white text-purple-600'
                    : 'text-white bg-purple-700'
                }`}
              >
                👤 Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
