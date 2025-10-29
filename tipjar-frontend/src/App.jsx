import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from './components/Navbar';
import { OrderBook } from './components/OrderBook';
import { CreateOrderForm } from './components/CreateOrderForm';
import { MyOrders } from './components/MyOrders';
import { UserProfile } from './components/UserProfile';
import { WelcomePage } from './components/WelcomePage';
import './App.css';

export default function App() {
  const { connected } = useWallet();
  const [currentView, setCurrentView] = useState('marketplace');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!connected ? (
          <WelcomePage />
        ) : (
          <>
            {currentView === 'marketplace' && <OrderBook />}
            {currentView === 'createOrder' && <CreateOrderForm />}
            {currentView === 'myOrders' && <MyOrders />}
            {currentView === 'profile' && <UserProfile />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                💱 Solanita P2P
              </h3>
              <p className="text-sm text-gray-600">
                Secure P2P crypto payments for cross-border transactions between USA and México.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>🔒 Secure Escrow System</li>
                <li>⚡ Fast Settlements (STP)</li>
                <li>✅ KYC Verification</li>
                <li>🛡️ Dispute Resolution</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Information</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>💰 Fee: 0.5%</li>
                <li>💵 Limit: 9,000 MXN/tx</li>
                <li>🌐 Network: Solana Devnet</li>
                <li>📱 Status: Beta</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>© 2024 Solanita P2P. Built on Solana. Made with 💜</p>
            <p className="mt-2">
              ⚠️ Beta Version - Use at your own risk. Always verify transactions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
