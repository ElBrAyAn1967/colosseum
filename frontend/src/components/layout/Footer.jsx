export default function Footer() {
  return (
    <footer className="bg-tipjar-dark-light border-t border-tipjar-dark-border mt-20">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 gradient-text">TipJar P2P</h3>
            <p className="text-gray-400 text-sm">
              Secure P2P cross-border payments between USA and Mexico on Solana blockchain.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-md font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/marketplace" className="text-gray-400 hover:text-tipjar-secondary">
                  Marketplace
                </a>
              </li>
              <li>
                <a href="/docs" className="text-gray-400 hover:text-tipjar-secondary">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-tipjar-secondary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-md font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://twitter.com" className="text-gray-400 hover:text-tipjar-secondary">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://discord.com" className="text-gray-400 hover:text-tipjar-secondary">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://github.com" className="text-gray-400 hover:text-tipjar-secondary">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider"></div>

        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TipJar P2P. Built with ❤️ on Solana.</p>
        </div>
      </div>
    </footer>
  );
}
