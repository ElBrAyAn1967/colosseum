import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WelcomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="text-6xl mb-6">💱</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Solanita P2P
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Secure Cross-Border Crypto Payments
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Buy and sell crypto with MXN using a secure escrow system.
          Lightning-fast settlements powered by Solana blockchain.
        </p>

        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-700 hover:!to-indigo-700 !text-white !px-8 !py-4 !text-lg !rounded-lg !font-semibold" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Secure Escrow
          </h3>
          <p className="text-sm text-gray-600">
            Your crypto is locked in a smart contract until payment is confirmed.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Fast Settlement
          </h3>
          <p className="text-sm text-gray-600">
            STP integration for instant MXN transfers. Oracle verification in minutes.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            KYC Verified
          </h3>
          <p className="text-sm text-gray-600">
            Trade with confidence knowing all users are verified.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Dispute Resolution
          </h3>
          <p className="text-sm text-gray-600">
            Fair arbitration system protects both buyers and sellers.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Sellers */}
          <div className="border-r border-gray-200 pr-8">
            <h3 className="text-xl font-semibold text-purple-600 mb-4">
              📤 Selling Crypto
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">1.</span>
                <span>Create a sell order with your desired rate</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">2.</span>
                <span>Wait for a buyer to accept</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">3.</span>
                <span>Deposit crypto into secure escrow</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">4.</span>
                <span>Buyer sends MXN to your account</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">5.</span>
                <span>Oracle verifies and releases crypto</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">6.</span>
                <span>You receive MXN! ✅</span>
              </li>
            </ol>
          </div>

          {/* For Buyers */}
          <div className="border-r border-gray-200 pr-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">
              📥 Buying Crypto
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">1.</span>
                <span>Browse the order book</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">2.</span>
                <span>Accept an order with good rate</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">3.</span>
                <span>Seller deposits crypto to escrow</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">4.</span>
                <span>Send MXN using STP/SPEI</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">5.</span>
                <span>Confirm payment with transaction ID</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">6.</span>
                <span>Receive crypto in your wallet! ✅</span>
              </li>
            </ol>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              🛡️ Security
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Smart contract escrow</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>KYC verification required</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Oracle payment verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Dispute resolution system</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>24h timeout protection</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Transparent on-chain</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported Tokens */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Supported Assets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">◎</div>
            <h3 className="text-lg font-semibold mb-2">SOL</h3>
            <p className="text-sm text-gray-600">Native Solana token</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">💵</div>
            <h3 className="text-lg font-semibold mb-2">USDC</h3>
            <p className="text-sm text-gray-600">USD Stablecoin</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">💲</div>
            <h3 className="text-lg font-semibold mb-2">USDT</h3>
            <p className="text-sm text-gray-600">Tether Stablecoin</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">0.5%</div>
            <div className="text-sm text-gray-600">Platform Fee</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">9,000</div>
            <div className="text-sm text-gray-600">MXN Max per TX</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">&lt; 5m</div>
            <div className="text-sm text-gray-600">Avg Settlement</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Availability</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Trading?
        </h2>
        <p className="text-lg mb-8 opacity-90">
          Connect your wallet to access the P2P marketplace
        </p>
        <WalletMultiButton className="!bg-white !text-purple-600 hover:!bg-gray-100 !px-8 !py-4 !text-lg !rounded-lg !font-semibold" />
      </div>

      {/* Beta Warning */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">
              Beta Version - Important Notice
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Currently running on Solana Devnet (test network)</li>
              <li>• Use test tokens only, not real funds</li>
              <li>• Features may change during development</li>
              <li>• Always verify transaction details before confirming</li>
              <li>• Report bugs and issues to our team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
