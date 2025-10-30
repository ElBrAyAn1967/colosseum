import { useWallet } from '@solana/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import WalletInfo from '../components/features/wallet/WalletInfo';
import UserStats from '../components/features/profile/UserStats';

export default function Dashboard() {
  const { connected } = useWallet();

  if (!connected) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold mb-8">
        <span className="gradient-text">Dashboard</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Info */}
        <WalletInfo />

        {/* Quick Stats */}
        <div className="md:col-span-2">
          <UserStats profile={null} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
        </div>
        <div className="card-body">
          <p className="text-gray-400 text-center py-8">
            No recent activity to display
          </p>
        </div>
      </div>
    </div>
  );
}
