import React, { useEffect, useState } from 'react';
import { useP2PProgram } from '../hooks/useP2PProgram';
import { useWallet } from '@solana/wallet-adapter-react';

export function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { checkUserProfile, createUserProfile, publicKey, connected } = useP2PProgram();
  const { wallet } = useWallet();

  useEffect(() => {
    if (connected) {
      loadProfile();
    }
  }, [connected, publicKey]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await checkUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (kycVerified) => {
    try {
      setCreating(true);
      const tx = await createUserProfile(kycVerified, null);
      alert(`✅ Profile created!\n\nTransaction: ${tx}\n\nYou can now create and accept orders.`);
      await loadProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your Solana wallet to view your profile
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Create Your Profile
          </h2>
          <p className="text-gray-600">
            You need to create a profile before using the P2P marketplace
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">📝 What is KYC Verification?</h3>
          <p className="text-sm text-blue-800 mb-3">
            KYC (Know Your Customer) verification helps ensure safe and compliant transactions.
          </p>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Required for all trading activities</li>
            <li>Protects against fraud and scams</li>
            <li>Enables higher transaction limits</li>
            <li>One-time verification process</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleCreateProfile(true)}
            disabled={creating}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              creating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {creating ? '⏳ Creating...' : '✅ Create Profile (With KYC)'}
          </button>

          <button
            onClick={() => handleCreateProfile(false)}
            disabled={creating}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              creating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {creating ? '⏳ Creating...' : '⚠️ Create Profile (Without KYC)'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          ⚠️ Without KYC verification, you won't be able to create or accept orders
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
        <button
          onClick={loadProfile}
          className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </h3>
            <p className="text-sm text-gray-600">Solana Wallet Address</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* KYC Status */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">KYC Status</span>
              {profile.kycVerified ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  ✅ Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                  ❌ Not Verified
                </span>
              )}
            </div>
            {profile.kycNftMint && (
              <p className="text-xs text-gray-500 font-mono">
                NFT: {profile.kycNftMint.toString().slice(0, 8)}...
              </p>
            )}
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Account Status</span>
              {profile.isActive ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  🟢 Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                  ⚪ Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {profile.totalTrades?.toString() || '0'}
          </div>
          <div className="text-sm text-blue-900 font-medium">Total Trades</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {profile.successfulTrades?.toString() || '0'}
          </div>
          <div className="text-sm text-green-900 font-medium">Successful</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {profile.disputedTrades?.toString() || '0'}
          </div>
          <div className="text-sm text-orange-900 font-medium">Disputed</div>
        </div>
      </div>

      {/* Success Rate */}
      {profile.totalTrades > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-900">Success Rate</span>
            <span className="text-2xl font-bold text-purple-600">
              {((profile.successfulTrades / profile.totalTrades) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{
                width: `${(profile.successfulTrades / profile.totalTrades) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Account Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Owner</span>
            <span className="font-mono text-gray-900">
              {profile.owner.toString().slice(0, 20)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created At</span>
            <span className="text-gray-900">
              {new Date(profile.createdAt.toNumber() * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* KYC Warning */}
      {!profile.kycVerified && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                KYC Verification Required
              </h4>
              <p className="text-sm text-yellow-800 mb-3">
                You need to complete KYC verification to:
              </p>
              <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                <li>Create sell orders</li>
                <li>Accept buy orders</li>
                <li>Trade up to 9,000 MXN per transaction</li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium">
                Start KYC Verification →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
