import { useWallet } from '@solana/wallet-adapter-react';
import { truncateAddress } from '../../../utils/helpers';

/**
 * Display wallet information (balance, address)
 */
export default function WalletInfo() {
  const { publicKey, connected } = useWallet();

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="text-lg font-semibold mb-4">Wallet Info</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400">Address</p>
            <p className="font-mono text-sm text-tipjar-accent">
              {truncateAddress(publicKey.toString())}
            </p>
          </div>
          {/* Balance will be added with useBalance hook */}
        </div>
      </div>
    </div>
  );
}
