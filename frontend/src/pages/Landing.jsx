import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function Landing() {
  return (
    <div className="container-custom">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center text-center py-20">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Cross-Border P2P</span>
            <br />
            Payments on Solana
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Secure, fast, and transparent crypto-to-fiat transactions between USA and Mexico.
            Trade SOL, USDC, and USDT with built-in escrow protection.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/marketplace">
              <Button size="lg" variant="primary">
                Explore Marketplace
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose <span className="gradient-text">TipJar P2P</span>?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-gradient p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-3">Secure Escrow</h3>
            <p className="text-gray-300">
              Smart contract-based escrow ensures your funds are safe until payment is confirmed.
            </p>
          </div>

          <div className="card-gradient p-8 text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3">Fast Settlements</h3>
            <p className="text-gray-300">
              Solana's high-speed blockchain enables near-instant transaction finality.
            </p>
          </div>

          <div className="card-gradient p-8 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">Low Fees</h3>
            <p className="text-gray-300">
              Only 0.5% platform fee. No hidden charges or intermediary costs.
            </p>
          </div>

          <div className="card-gradient p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-3">KYC Verified</h3>
            <p className="text-gray-300">
              On-chain KYC via NFTs ensures compliance and user safety.
            </p>
          </div>

          <div className="card-gradient p-8 text-center">
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold mb-3">Dispute Resolution</h3>
            <p className="text-gray-300">
              Built-in arbitration system for fair conflict resolution.
            </p>
          </div>

          <div className="card-gradient p-8 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold mb-3">Multi-Token</h3>
            <p className="text-gray-300">
              Support for SOL, USDC, and USDT with more tokens coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="card-gradient p-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8">
            Connect your wallet and start trading in minutes.
          </p>
          <Link to="/marketplace">
            <Button size="lg" variant="secondary">
              Start Trading Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
