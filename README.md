# 💱 Solanita P2P - Cross-Border Payment System

A decentralized P2P payment system built on Solana for secure cross-border transactions between USA and Mexico.

![Solana](https://img.shields.io/badge/Solana-Blockchain-14F195?logo=solana)
![Anchor](https://img.shields.io/badge/Anchor-0.32.1-purple)
![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- **🔒 Escrow System**: Secure smart contract-based escrow for SOL, USDC, and USDT
- **💸 Cross-Border Payments**: Seamless crypto-to-fiat via STP (Sistema de Transferencias y Pagos)
- **✅ KYC Verification**: On-chain KYC via NFTs with 4 verification levels
- **⚖️ Dispute Resolution**: Built-in arbitration system with 50/50 split option
- **🛡️ Oracle Integration**: Off-chain payment verification through oracle backend
- **📊 Transaction Limits**: Compliant with Mexican regulations (9,000 MXN max)
- **💰 Low Fees**: 0.5% platform fee on transactions
- **🌐 Multi-Token Support**: Native SOL and SPL tokens (USDC, USDT)

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  React Frontend │────▶│  Solana Program  │◀────│  Oracle Backend │
│   (Vercel)      │     │   (Anchor/Rust)  │     │   (Express.js)  │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │      │                    │
                              │      │                    │
                              ▼      ▼                    ▼
                         ┌─────┐  ┌─────┐         ┌──────────┐
                         │ SPL │  │ KYC │         │   STP    │
                         │Token│  │ NFT │         │ API (MX) │
                         └─────┘  └─────┘         └──────────┘
```

### Components

1. **Solana Program** (`tipjar/programs/tipjar/`):
   - Rust smart contract using Anchor framework
   - Handles escrow, orders, disputes, and fund releases
   - Deployed on Solana blockchain

2. **Frontend** (`tipjar-frontend/`):
   - React + Vite + Tailwind CSS
   - Wallet adapter integration (Phantom, Solflare, etc.)
   - User-friendly marketplace UI

3. **Oracle Backend** (`tipjar/oracle-backend/`):
   - Node.js + Express + TypeScript
   - Verifies fiat payments via STP API
   - Updates on-chain order status

4. **KYC NFT System** (`tipjar/kyc-nft-system/`):
   - Separate Solana program for KYC verification
   - Metaplex-compatible NFTs
   - 4 verification levels (Basic, Standard, Enhanced, Premium)

---

## 🚀 Quick Start

### Prerequisites

- **Solana CLI** 1.18+
- **Anchor CLI** 0.32.1
- **Rust** 1.75+
- **Node.js** 18+
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/solanita-p2p.git
cd solanita-p2p

# Install Solana program dependencies
cd tipjar
anchor build

# Deploy to devnet
anchor deploy
# Save the Program ID shown in output

# Install frontend dependencies
cd ../tipjar-frontend
npm install

# Install oracle dependencies
cd ../tipjar/oracle-backend
npm install
```

### Configuration

1. **Update Program ID** in:
   - `tipjar-frontend/src/hooks/useP2PProgram.js`
   - `tipjar-frontend/.env`
   - `tipjar/oracle-backend/.env`

2. **Copy IDL to frontend**:
   ```bash
   cp tipjar/target/idl/tipjar.json tipjar-frontend/src/idl/
   ```

3. **Set environment variables** (see [ENV_VARIABLES_GUIDE.md](ENV_VARIABLES_GUIDE.md))

### Run Locally

```bash
# Terminal 1: Frontend
cd tipjar-frontend
npm run dev

# Terminal 2: Oracle Backend
cd tipjar/oracle-backend
npm run dev

# Terminal 3: Oracle Polling Service
cd tipjar/oracle-backend
npm run poll
```

Visit: http://localhost:5173

---

## 📚 Documentation

- **[DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)** - Complete guide for deploying to Vercel
- **[ENV_VARIABLES_GUIDE.md](ENV_VARIABLES_GUIDE.md)** - Environment variables reference
- **[REQUISITOS_PROYECTO.md](REQUISITOS_PROYECTO.md)** - Full project requirements (Spanish)
- **[COMPLETE_DOCUMENTATION.md](COMPLETE_DOCUMENTATION.md)** - Comprehensive system documentation
- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide

---

## 🔧 Tech Stack

### Blockchain
- **Solana** - High-performance blockchain
- **Anchor 0.32.1** - Rust framework for Solana programs
- **SPL Token Program** - For USDC/USDT support

### Frontend
- **React 19.1** - UI framework
- **Vite 7.1** - Build tool
- **Tailwind CSS 4.1** - Styling
- **@solana/wallet-adapter** - Multi-wallet support
- **@coral-xyz/anchor** - Client SDK

### Backend
- **Node.js** - Runtime
- **Express** - API server
- **TypeScript** - Type safety

---

## 💻 Program Instructions

The Solana program includes 18+ instructions:

### Core Functions
- `initialize_platform` - Setup platform with authority and fee structure
- `create_user_profile` - Create user profile with KYC status
- `create_order` - Seller creates new P2P order
- `accept_order` - Buyer accepts an order
- `deposit_to_escrow_native` - Seller deposits SOL to escrow
- `deposit_to_escrow_spl` - Seller deposits SPL tokens to escrow
- `confirm_fiat_payment` - Oracle confirms fiat payment received
- `release_funds_native` - Release SOL to buyer after confirmation
- `release_funds_spl` - Release SPL tokens to buyer

### Dispute Management
- `open_dispute` - Either party opens a dispute
- `resolve_dispute` - Authority resolves dispute
- `resolve_dispute_split_native` - 50/50 split for SOL
- `resolve_dispute_split_spl` - 50/50 split for SPL tokens

### Order Management
- `cancel_order_native` - Cancel order and return SOL
- `cancel_order_spl` - Cancel order and return SPL tokens
- `update_oracle_status` - Oracle updates payment verification

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `VITE_PROGRAM_ID`
   - `VITE_NETWORK`
4. Deploy

See [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) for detailed instructions.

### Program (Solana Devnet/Mainnet)

```bash
# Devnet
anchor deploy

# Mainnet (after auditing)
anchor deploy --provider.cluster mainnet
```

### Oracle Backend (Railway/Render/Heroku)

Deploy the `oracle-backend` directory to any Node.js hosting service.

---

## 🧪 Testing

```bash
# Run all tests
cd tipjar
anchor test

# Run specific test suite
anchor test --skip-local-validator  # Use devnet
```

Test coverage includes:
- Platform initialization
- User profile creation
- Complete P2P flow (SOL and USDC)
- Dispute system
- Order cancellation
- Validation and limits

---

## 🔐 Security

### Implemented
- ✅ PDA-based escrow accounts
- ✅ Authority-based access control
- ✅ Transaction limit enforcement (9,000 MXN)
- ✅ KYC verification requirements
- ✅ Oracle signature verification
- ✅ Secure dispute resolution

### Recommendations
- 🔒 Conduct security audit before mainnet
- 🔒 Use private RPC endpoints in production
- 🔒 Implement rate limiting on oracle backend
- 🔒 Regular key rotation for oracle wallet
- 🔒 Monitor platform for suspicious activity

---

## 📊 Fees

- **Platform Fee**: 0.5% (50 basis points) on all transactions
- **Transaction Limit**: 9,000 MXN per order (Mexican regulation compliance)

---

## 🛣️ Roadmap

- [x] Core P2P escrow system
- [x] Multi-token support (SOL, USDC, USDT)
- [x] KYC NFT verification
- [x] Oracle integration (simulated)
- [x] Dispute resolution
- [x] Frontend marketplace
- [ ] Real STP API integration
- [ ] Underdog Protocol reputation system
- [ ] Mobile app (React Native)
- [ ] Additional payment methods
- [ ] Multi-language support
- [ ] Mainnet deployment

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - Blockchain infrastructure
- **Anchor Framework** - Development framework
- **STP (Sistema de Transferencias y Pagos)** - Mexican payment system
- **Metaplex** - NFT standard

---

## 📞 Contact & Support

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: See `/docs` folder
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet

---

## 🌟 Show your support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ on Solana**

*Enabling secure cross-border payments for everyone.*
