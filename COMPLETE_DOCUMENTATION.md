# 🚀 Sistema de Pagos P2P para Países Fronterizos - Documentación Completa

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Guía de Instalación](#guía-de-instalación)
5. [Configuración](#configuración)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Integración con APIs Reales](#integración-con-apis-reales)
9. [Seguridad](#seguridad)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

Sistema completo de pagos P2P blockchain para transferencias transfronterizas entre USA y México, con las siguientes características:

### ✅ Características Implementadas

- **Programa Solana (Anchor)**
  - Escrow seguro para SOL, USDC y USDT
  - Sistema de disputas con arbitraje 50/50
  - Verificación KYC on-chain mediante NFTs
  - Límite de transacción: 9,000 MXN
  - Comisión de plataforma: 0.5%
  - Integración con oráculos STP

- **Backend Oráculo STP**
  - Verificación automática de pagos STP (simulado)
  - API REST para verificación manual
  - Webhook handler para notificaciones
  - Polling automático cada 30 segundos
  - Modo simulación para desarrollo

- **Sistema KYC NFT**
  - 4 niveles de verificación (Basic, Standard, Enhanced, Premium)
  - NFTs Metaplex compatibles
  - Emisión, revocación y renovación
  - Verificación on-chain

- **Frontend React**
  - Marketplace de órdenes P2P
  - Integración con wallets Solana
  - UI moderna con Tailwind CSS
  - Hooks para interacción con programa

- **Testing Exhaustivo**
  - Tests de Anchor completos
  - Flujos E2E: SOL, USDC, disputas, cancelaciones
  - Validaciones de KYC y límites

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                              │
│  (USA: Vende Crypto) ←→ (MX: Compra Crypto)                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────┐          ┌──────────────────────┐
│   Frontend React     │          │  Frontend React      │
│   - Wallet Connect   │          │  - Wallet Connect    │
│   - Order Book       │          │  - Order Management  │
│   - Dispute UI       │          │  - Payment Confirm   │
└──────────┬───────────┘          └───────────┬──────────┘
           │                                  │
           └──────────────┬───────────────────┘
                          ▼
           ┌─────────────────────────────┐
           │   Solana Blockchain         │
           │                             │
           │  ┌────────────────────────┐ │
           │  │  P2P Program (Anchor)  │ │
           │  │  - Escrow              │ │
           │  │  - Orders              │ │
           │  │  - Disputes            │ │
           │  │  - User Profiles       │ │
           │  └─────────┬──────────────┘ │
           │            │                │
           │  ┌─────────▼──────────────┐ │
           │  │  KYC NFT Program       │ │
           │  │  - Issue NFT           │ │
           │  │  - Verify KYC          │ │
           │  └────────────────────────┘ │
           └──────────┬──────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Oracle Backend      │
           │  - STP Verification  │
           │  - Polling Service   │
           │  - Webhook Handler   │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  STP API (México)    │
           │  - Payment Verify    │
           │  - Transaction Query │
           └──────────────────────┘
```

---

## 📦 Componentes Principales

### 1. Programa Solana P2P ([tipjar/programs/tipjar/src/lib.rs](file:///home/Brayan-sol/solanita/tipjar/programs/tipjar/src/lib.rs))

**Instrucciones implementadas:**
- `initialize_platform` - Inicializar plataforma
- `create_user_profile` - Crear perfil con KYC
- `create_order` - Crear orden de venta
- `accept_order` - Aceptar orden (buyer)
- `deposit_to_escrow_native` - Depositar SOL en escrow
- `deposit_to_escrow_spl` - Depositar SPL tokens
- `confirm_fiat_payment` - Confirmar pago MXN
- `release_funds_native` - Liberar SOL
- `release_funds_spl` - Liberar SPL tokens
- `open_dispute` - Abrir disputa
- `resolve_dispute` - Resolver disputa
- `resolve_dispute_split_native` - Split 50/50 SOL
- `resolve_dispute_split_spl` - Split 50/50 SPL
- `cancel_order_native` - Cancelar y devolver SOL
- `cancel_order_spl` - Cancelar y devolver SPL
- `update_oracle_status` - Actualizar confirmación STP

### 2. Backend Oráculo STP ([oracle-backend/](file:///home/Brayan-sol/solanita/tipjar/oracle-backend/))

**Archivos clave:**
- `src/index.ts` - Entry point
- `src/oracle-service.ts` - Lógica principal del oráculo
- `src/stp-api.ts` - Cliente API STP (simulado)
- `src/solana-client.ts` - Cliente Solana
- `src/api-server.ts` - API REST

**Endpoints:**
- `GET /health` - Health check
- `GET /status` - Estado del oráculo
- `POST /verify-order` - Verificar orden manualmente
- `POST /verify-stp-payment` - Verificar pago STP
- `POST /webhook/stp` - Webhook de STP
- `POST /dev/simulate-payment` - Simular pago (dev)

### 3. Sistema KYC NFT ([kyc-nft-system/](file:///home/Brayan-sol/solanita/tipjar/kyc-nft-system/))

**Instrucciones:**
- `initialize` - Inicializar sistema KYC
- `issue_kyc_nft` - Emitir NFT de verificación
- `revoke_kyc_nft` - Revocar NFT
- `renew_kyc_nft` - Renovar KYC
- `verify_kyc_status` - Verificar estado

**Niveles de verificación:**
- **Basic**: Email + teléfono (hasta 1,000 MXN)
- **Standard**: + ID oficial (hasta 5,000 MXN)
- **Enhanced**: + comprobante domicilio (hasta 9,000 MXN)
- **Premium**: + biometría (sin límite adicional)

### 4. Frontend React ([tipjar-frontend/](file:///home/Brayan-sol/solanita/tipjar-frontend/))

**Componentes:**
- `OrderBook.tsx` - Libro de órdenes
- `useP2PProgram.ts` - Hook para interactuar con programa

---

## 🛠️ Guía de Instalación

### Requisitos Previos

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Node.js 18+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 1. Clonar e Instalar

```bash
cd /home/Brayan-sol/solanita/tipjar

# Instalar dependencias del programa
npm install

# Instalar dependencias del oráculo
cd oracle-backend
npm install
cd ..

# Instalar dependencias del frontend
cd ../tipjar-frontend
npm install
cd ../tipjar
```

### 2. Compilar Programa Solana

```bash
# Compilar
anchor build

# Esto generará:
# - target/deploy/tipjar.so (programa compilado)
# - target/types/tipjar.ts (tipos TypeScript)
# - target/idl/tipjar.json (IDL del programa)
```

### 3. Configurar Solana

```bash
# Crear wallet local (si no tienes)
solana-keygen new --outfile ~/.config/solana/id.json

# Configurar red (usar devnet para testing)
solana config set --url devnet

# Obtener SOL de prueba
solana airdrop 2

# Verificar balance
solana balance
```

### 4. Deploy del Programa

```bash
# Deploy a devnet
anchor deploy

# Esto te dará el Program ID
# Actualiza el Program ID en:
# - lib.rs (declare_id!)
# - Anchor.toml
# - frontend/src/hooks/useP2PProgram.ts
# - oracle-backend/src/config.ts
```

### 5. Inicializar Programa

```bash
# Crear script de inicialización
anchor run initialize

# O manualmente con anchor test
anchor test --skip-local-validator
```

---

## ⚙️ Configuración

### Oracle Backend

```bash
cd oracle-backend
cp .env.example .env
```

Editar `.env`:

```env
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
ORACLE_PRIVATE_KEY=<tu_base58_private_key>

# Program ID (del deploy)
PROGRAM_ID=<program_id_despues_de_deploy>

# STP API (simulado por ahora)
STP_API_URL=https://api-sandbox.stpmex.com
STP_API_KEY=SIMULATED_API_KEY
STP_COMPANY_ID=DEMO_COMPANY

# Server
PORT=3001
NODE_ENV=development
```

### Frontend

```bash
cd ../tipjar-frontend
```

Crear `.env`:

```env
VITE_SOLANA_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=<program_id_despues_de_deploy>
```

---

## 🧪 Testing

### 1. Tests de Anchor

```bash
cd tipjar

# Compilar primero
anchor build

# Ejecutar tests
anchor test

# Tests específicos
anchor test -- --grep "Sistema de Disputas"
```

**Tests incluidos:**
- ✅ Inicialización de plataforma
- ✅ Creación de perfiles de usuario
- ✅ Flujo completo P2P con SOL
- ✅ Flujo completo P2P con USDC
- ✅ Sistema de disputas (split 50/50)
- ✅ Cancelación de órdenes
- ✅ Validaciones y límites
- ✅ Verificación KYC

### 2. Test del Oráculo

```bash
cd oracle-backend

# Desarrollo
npm run dev

# En otra terminal, probar endpoints
curl http://localhost:3001/health

# Simular verificación
curl -X POST http://localhost:3001/dev/simulate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST_001",
    "stpTransactionId": "STP_TX_12345678"
  }'
```

### 3. Test del Frontend

```bash
cd ../tipjar-frontend

# Desarrollo
npm run dev

# Abrir en navegador: http://localhost:5173
```

---

## 🚀 Deployment

### Deploy a Devnet

```bash
# 1. Compilar
anchor build

# 2. Deploy
anchor deploy --provider.cluster devnet

# 3. Anotar Program ID y actualizar en todos los lugares
```

### Deploy a Mainnet

```bash
# PRECAUCIÓN: Mainnet cuesta SOL real

# 1. Asegurarse de tener SOL suficiente
solana balance

# 2. Cambiar a mainnet
solana config set --url mainnet-beta

# 3. Deploy
anchor deploy --provider.cluster mainnet-beta

# 4. Inicializar programa
# Ejecutar script de inicialización en mainnet
```

### Deploy del Oráculo (Backend)

```bash
cd oracle-backend

# Opción 1: VPS (Digital Ocean, AWS, etc.)
npm run build
pm2 start dist/index.js --name stp-oracle

# Opción 2: Docker
docker build -t stp-oracle .
docker run -d -p 3001:3001 --env-file .env stp-oracle

# Opción 3: Railway/Render (PAAS)
# - Conectar repo de GitHub
# - Configurar build: npm run build
# - Configurar start: npm start
# - Agregar variables de entorno
```

### Deploy del Frontend

```bash
cd tipjar-frontend

# Build
npm run build

# Deploy a Vercel
vercel deploy

# O deploy a Netlify
netlify deploy --prod

# O servir estáticamente
npm run preview
```

---

## 🔌 Integración con APIs Reales

### API de STP (México)

Cuando tengas acceso a la API real de STP:

1. **Obtener credenciales**:
   - Registrarse en [STP](https://www.stpmex.com/)
   - Obtener API Key y Company ID
   - Configurar cuenta bancaria receptora

2. **Actualizar `oracle-backend/src/stp-api.ts`**:

```typescript
// Descomentar y actualizar el método verifyPayment:
async verifyPayment(transactionId: string): Promise<StpPaymentVerification> {
  try {
    // Llamada real a STP
    const response = await this.client.get(`/ordenes/ordenPago/${transactionId}`);

    return {
      transactionId: response.data.id,
      status: this.mapStpStatus(response.data.estado),
      amount: parseFloat(response.data.monto),
      currency: 'MXN',
      sender: {
        account: response.data.cuentaOrdenante,
        name: response.data.nombreOrdenante,
        bank: response.data.institucionOperante,
      },
      receiver: {
        account: response.data.cuentaBeneficiario,
        name: response.data.nombreBeneficiario,
        bank: response.data.institucionContraparte,
      },
      reference: response.data.referenciaNumerica,
      timestamp: new Date(response.data.fechaOperacion),
      confirmations: response.data.estado === 'LIQUIDADA' ? 1 : 0,
    };
  } catch (error) {
    console.error('Error al verificar pago en STP:', error);
    throw error;
  }
}
```

3. **Configurar webhook de STP**:
   - URL: `https://tu-dominio.com/webhook/stp`
   - Método: POST
   - Headers: `x-webhook-secret: tu_secret`

4. **Actualizar .env**:

```env
NODE_ENV=production
STP_API_URL=https://api.stpmex.com
STP_API_KEY=<tu_api_key_real>
STP_COMPANY_ID=<tu_company_id>
WEBHOOK_SECRET=<genera_uno_seguro>
```

### API de KYC

Servicios recomendados:

**Para México:**
- **Onfido**: https://onfido.com/
- **Truora**: https://www.truora.com/
- **Veriff**: https://www.veriff.com/

**Integración básica**:

```typescript
// Backend KYC Service
import { Onfido } from '@onfido/api';

const onfido = new Onfido({
  apiToken: process.env.ONFIDO_API_TOKEN,
  region: 'us',
});

async function verifyKYC(userId: string, documents: any) {
  // 1. Crear applicant
  const applicant = await onfido.applicant.create({
    firstName: documents.firstName,
    lastName: documents.lastName,
  });

  // 2. Upload documents
  await onfido.document.upload({
    applicantId: applicant.id,
    file: documents.idFront,
    type: 'national_identity_card',
    side: 'front',
  });

  // 3. Crear check
  const check = await onfido.check.create({
    applicantId: applicant.id,
    reportNames: ['document', 'facial_similarity_photo'],
  });

  // 4. Esperar resultado
  const result = await waitForCheckCompletion(check.id);

  if (result.status === 'complete' && result.result === 'clear') {
    // Emitir NFT KYC
    await issueKycNft(userId, 'Standard');
    return { approved: true };
  }

  return { approved: false, reason: result.result };
}
```

---

## 🔒 Seguridad

### Checklist de Seguridad para Producción

#### Programa Solana
- [ ] Auditoría de smart contract
- [ ] Verificar todos los `require!` checks
- [ ] Implementar límites de rate (instrucciones por usuario)
- [ ] Validar todas las cuentas con `has_one`
- [ ] Usar `realloc` con cuidado
- [ ] Implementar emergency pause mechanism

#### Oracle Backend
- [ ] Usar HTTPS obligatorio
- [ ] Validar firmas de webhooks
- [ ] Implementar rate limiting
- [ ] Usar secrets manager (AWS Secrets, HashiCorp Vault)
- [ ] Monitorear logs y alertas
- [ ] Backup de private keys
- [ ] No exponer private keys en logs

#### Frontend
- [ ] Validar inputs del usuario
- [ ] Nunca guardar private keys
- [ ] Usar HTTPS
- [ ] Implementar CSP headers
- [ ] Sanitizar URLs y datos
- [ ] Rate limiting en cliente

#### General
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Insurance fund para riesgos
- [ ] Documentación de incidentes
- [ ] Plan de recuperación de desastres

### Límites Recomendados

```rust
// En el programa
const MAX_TRANSACTION_AMOUNT_MXN: u64 = 9_000_000_000; // 9,000 MXN
const MIN_TRANSACTION_AMOUNT_MXN: u64 = 100_000_000;   // 100 MXN
const MAX_ORDERS_PER_USER_PER_DAY: u8 = 10;
const DISPUTE_TIMEOUT_SECONDS: i64 = 86400 * 3; // 3 días
```

---

## 🐛 Troubleshooting

### Error: "Program ID mismatch"

```bash
# Actualizar Program ID en todos los archivos después de deploy
# 1. lib.rs - declare_id!()
# 2. Anchor.toml - [programs.devnet]
# 3. frontend - VITE_PROGRAM_ID
# 4. oracle - PROGRAM_ID

# Recompilar
anchor build
anchor deploy
```

### Error: "Account not found"

```bash
# Asegurarse de que el programa está inicializado
anchor test --skip-build

# O inicializar manualmente
ts-node scripts/initialize.ts
```

### Error: "Insufficient funds"

```bash
# Obtener más SOL
solana airdrop 2

# O cambiar a devnet
solana config set --url devnet
```

### Oracle no verifica pagos

```bash
# 1. Verificar que el oráculo está corriendo
curl http://localhost:3001/status

# 2. Verificar logs
docker logs stp-oracle

# 3. Verificar private key del oráculo
# Debe ser la misma que la autoridad de la plataforma

# 4. Verificación manual
curl -X POST http://localhost:3001/verify-order \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_001"}'
```

### Frontend no conecta con wallet

```bash
# 1. Verificar que tienes una wallet instalada (Phantom, Solflare)
# 2. Verificar network en la wallet (debe ser devnet)
# 3. Verificar RPC URL en .env
# 4. Abrir console del navegador para ver errores
```

---

## 📊 Monitoreo y Métricas

### Métricas Clave

```typescript
// Dashboard recomendado (Grafana/DataDog)
- Total de órdenes creadas
- Volumen total (MXN y USD)
- Tasa de éxito de transacciones
- Tiempo promedio de confirmación
- Número de disputas
- Usuarios activos
- Comisiones generadas
```

### Logs Importantes

```bash
# Oracle logs
tail -f oracle-backend/logs/oracle.log

# Program logs (Solana)
solana logs <program_id>

# Frontend (browser console)
# Network tab -> buscar errores RPC
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Token Metadata](https://docs.metaplex.com/)
- [STP México](https://stpmex.zendesk.com/hc/es)

### Comunidades
- [Solana Discord](https://discord.com/invite/solana)
- [Anchor Discord](https://discord.gg/anchor)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

### Herramientas
- [Solana Explorer](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)
- [Phantom Wallet](https://phantom.app/)
- [Solana Beach](https://solanabeach.io/)

---

## 🎯 Roadmap Futuro

### Fase 1 (Actual)
- ✅ Programa Solana básico
- ✅ Oracle STP simulado
- ✅ Sistema KYC NFT
- ✅ Frontend básico
- ✅ Tests exhaustivos

### Fase 2 (Próximos 3 meses)
- [ ] Integración STP real
- [ ] Backend KYC con Onfido
- [ ] Mobile app (React Native)
- [ ] Notificaciones push
- [ ] Chat entre usuarios
- [ ] Sistema de reputación (Underdog Protocol)

### Fase 3 (6-12 meses)
- [ ] Soporte para más países (Colombia, Argentina)
- [ ] Más métodos de pago (Oxxo, 7-Eleven)
- [ ] Staking de governance token
- [ ] DAO para resolución de disputas
- [ ] API pública para integradores
- [ ] Programa de referidos

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

---

## 👥 Contacto y Soporte

- **GitHub**: [tu-repo](https://github.com/tu-usuario/solanita)
- **Email**: support@solanita.com
- **Discord**: [Únete a nuestra comunidad](#)
- **Twitter**: [@Solanita](#)

---

## 🙏 Agradecimientos

- Equipo de Solana Foundation
- Comunidad de Anchor
- Contribuidores open source
- Beta testers

---

**¡El sistema está listo para usarse! 🎉**

Recuerda:
1. Compilar el programa: `anchor build`
2. Hacer deploy: `anchor deploy`
3. Actualizar Program IDs en todos los archivos
4. Ejecutar tests: `anchor test`
5. Iniciar oráculo: `cd oracle-backend && npm run dev`
6. Iniciar frontend: `cd tipjar-frontend && npm run dev`

Para producción, sigue las secciones de **Deployment** e **Integración con APIs Reales**.

¡Buena suerte! 🚀
