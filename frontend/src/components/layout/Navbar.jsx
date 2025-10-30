import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container-custom flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold gradient-text">
            TipJar P2P
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/marketplace"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Marketplace
          </Link>
          <Link
            to="/my-orders"
            className="text-gray-300 hover:text-white transition-colors"
          >
            My Orders
          </Link>
          <Link
            to="/profile"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Profile
          </Link>
        </div>

        {/* Wallet Button */}
        <div>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
