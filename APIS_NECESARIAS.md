# 🔌 APIs Necesarias para Funcionalidad 100% - Solanita P2P

Esta guía lista todas las APIs necesarias para que el sistema funcione al 100% en producción.

---

## 📊 Estado Actual vs Producción

| Componente | Desarrollo (Ahora) | Producción (100%) |
|------------|-------------------|-------------------|
| Solana RPC | ✅ Público Devnet | ⚠️ RPC Privado requerido |
| STP API | ✅ Simulado | ❌ API Real necesaria |
| KYC Verificación | ⚠️ Manual/NFT básico | ❌ Proveedor KYC necesario |
| Price Oracle | ❌ No implementado | ❌ Oracle de precios necesario |
| IPFS/Arweave | ❌ No implementado | ⚠️ Opcional para metadata |

---

## 🚀 APIs CRÍTICAS (Obligatorias)

### 1. 🌐 Solana RPC Provider

#### **Para qué sirve**:
- Conexión a la blockchain de Solana
- Envío de transacciones
- Consulta de estado de cuentas
- Lectura de datos del programa

#### **Opciones Recomendadas**:

#### **a) Helius (Recomendado #1)**
- **URL**: https://www.helius.dev/
- **Precio**:
  - Free Tier: 100,000 requests/mes
  - Growth: $49/mes - 1M requests
  - Business: $249/mes - 10M requests
- **Features**:
  - RPC ultra-rápido
  - Webhooks para transacciones
  - APIs mejoradas (DAS API, NFT API)
  - Dashboard con analytics
- **Configuración**:
  ```env
  VITE_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_API_KEY
  ```
- **Registro**: https://dev.helius.xyz/

#### **b) Alchemy (Recomendado #2)**
- **URL**: https://www.alchemy.com/solana
- **Precio**:
  - Free: 300M compute units/mes
  - Growth: $49/mes
  - Scale: $199/mes
- **Features**:
  - NFT API incluida
  - Enhanced APIs
  - Webhooks
  - Dashboard robusto
- **Configuración**:
  ```env
  VITE_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/TU_API_KEY
  ```
- **Registro**: https://alchemy.com/

#### **c) QuickNode**
- **URL**: https://www.quicknode.com/chains/sol
- **Precio**:
  - Build: $49/mes
  - Scale: $299/mes
- **Features**:
  - Global edge network
  - Add-ons disponibles
  - 99.9% uptime SLA
- **Configuración**:
  ```env
  VITE_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/TU_TOKEN/
  ```
- **Registro**: https://www.quicknode.com/

#### **Recomendación**:
```
🥇 Helius - Mejor para aplicaciones P2P, tiene webhooks nativos
🥈 Alchemy - Mejor para NFTs y analytics
🥉 QuickNode - Mejor para empresas que necesitan SLA
```

---

### 2. 💸 STP API (Sistema de Transferencias y Pagos)

#### **Para qué sirve**:
- Verificación de pagos en pesos mexicanos (MXN)
- Transferencias SPEI en México
- Confirmación de recepción de fondos fiat

#### **Proveedor**: STP (Banco de México)
- **URL**: https://www.stpmex.com/
- **Documentación**: https://stpmex.zendesk.com/hc/es

#### **Proceso de Registro**:

1. **Contacto Comercial**:
   - Email: comercial@stpmex.com
   - Teléfono: +52 (55) 5004 0990
   - Solicita "API de SPEI para plataforma P2P"

2. **Requisitos**:
   - Empresa constituida en México
   - Alta en SAT (RFC)
   - Identificación oficial del representante legal
   - Comprobante de domicilio
   - Acta constitutiva
   - Plan de negocio

3. **Costo Estimado**:
   - Setup fee: ~$10,000 - $30,000 MXN (una vez)
   - Comisión por transacción: ~$3 - $5 MXN
   - Membresía mensual: Variable según volumen

4. **Tiempo de aprobación**: 2-4 semanas

#### **Configuración**:

**Ambiente de Pruebas (Sandbox)**:
```env
STP_API_URL=https://demo.stpmex.com/speiws/rest
STP_API_KEY=tu_api_key_pruebas
STP_COMPANY_ID=tu_company_id
STP_PRIVATE_KEY_PATH=/ruta/a/tu/llave_privada.key
```

**Producción**:
```env
STP_API_URL=https://prod.stpmex.com/speiws/rest
STP_API_KEY=tu_api_key_produccion
STP_COMPANY_ID=tu_company_id
STP_PRIVATE_KEY_PATH=/ruta/a/tu/llave_privada.key
```

#### **Endpoints Principales**:
```javascript
// Verificar pago recibido
POST /ordenPago/registra

// Consultar estado de orden
GET /ordenPago/{id}

// Recibir webhook de confirmación
POST /webhook/confirmacion
```

#### **Alternativas si no calificas para STP**:

##### **a) Openpay**
- **URL**: https://www.openpay.mx/
- **Costo**: Setup gratis, 2.9% + $3 MXN por transacción
- **Pros**: Fácil integración, no requiere empresa
- **Contras**: Más caro, límites menores
- **API Docs**: https://www.openpay.mx/docs/

##### **b) Conekta**
- **URL**: https://www.conekta.com/
- **Costo**: 2.9% + $3 MXN por transacción
- **Pros**: Dashboard moderno, webhooks
- **API Docs**: https://developers.conekta.com/

##### **c) Stripe (solo SPEI)**
- **URL**: https://stripe.com/mx
- **Costo**: 3.6% por transacción
- **Pros**: Reconocimiento global
- **Contras**: Más caro
- **API Docs**: https://stripe.com/docs/payments/oxxo

---

### 3. ✅ KYC Provider (Know Your Customer)

#### **Para qué sirve**:
- Verificación de identidad de usuarios
- Cumplimiento regulatorio (AML/KYC)
- Prevención de fraude

#### **Opciones Recomendadas**:

#### **a) Onfido (Recomendado)**
- **URL**: https://onfido.com/
- **Precio**:
  - Verificación de documento: $1-2 USD
  - Verificación facial: $0.50-1 USD
  - Pricing personalizado para volumen
- **Features**:
  - 195+ países soportados
  - Verificación en tiempo real
  - SDK para móvil y web
  - Compliance con regulaciones mexicanas
- **API Docs**: https://documentation.onfido.com/
- **Configuración**:
  ```env
  ONFIDO_API_TOKEN=tu_api_token
  ONFIDO_REGION=us  # o 'eu' o 'ca'
  ```

#### **b) Truora (Para Latinoamérica)**
- **URL**: https://www.truora.com/
- **Precio**: $1-3 USD por verificación
- **Features**:
  - Especializado en LATAM
  - Soporte en español
  - Verificaciones locales (México, Colombia, etc.)
- **API Docs**: https://docs.truora.com/
- **Configuración**:
  ```env
  TRUORA_API_KEY=tu_api_key
  ```

#### **c) Veriff**
- **URL**: https://www.veriff.com/
- **Precio**: Desde $1 USD por verificación
- **Features**:
  - 230+ países
  - Video verification
  - AML screening
- **API Docs**: https://developers.veriff.com/
- **Configuración**:
  ```env
  VERIFF_API_KEY=tu_api_key
  VERIFF_API_SECRET=tu_api_secret
  ```

#### **Niveles de Verificación Sugeridos**:

```javascript
// Basic (email + phone)
- Límite: 1,000 MXN

// Standard (+ documento de identidad)
- Límite: 5,000 MXN

// Enhanced (+ comprobante de domicilio)
- Límite: 9,000 MXN

// Premium (+ verificación facial)
- Límite: Sin límite adicional (9,000 MXN)
```

---

## 🔧 APIs IMPORTANTES (Muy Recomendadas)

### 4. 💱 Price Oracle (Conversión SOL/USDC → MXN)

#### **Para qué sirve**:
- Obtener precio actual de SOL en MXN
- Calcular equivalencias para límites de 9,000 MXN
- Mostrar precios en tiempo real

#### **Opciones**:

#### **a) Pyth Network (Recomendado para Solana)**
- **URL**: https://pyth.network/
- **Precio**: GRATIS (on-chain)
- **Features**:
  - Actualización cada 400ms
  - Datos on-chain verificables
  - Múltiples pares de trading
- **Integración**:
  ```javascript
  import { PythHttpClient } from "@pythnetwork/client";

  const pythClient = new PythHttpClient(connection, PYTH_PROGRAM_ID);
  const priceData = await pythClient.getData();
  const solUsdPrice = priceData.productPrice.price;
  ```
- **Docs**: https://docs.pyth.network/

#### **b) Switchboard**
- **URL**: https://switchboard.xyz/
- **Precio**: GRATIS (on-chain)
- **Features**:
  - Oracle descentralizado
  - Customizable feeds
- **Docs**: https://docs.switchboard.xyz/

#### **c) CoinGecko API (Off-chain, backup)**
- **URL**: https://www.coingecko.com/en/api
- **Precio**:
  - Free: 10-50 calls/min
  - Pro: $129/mes - 500 calls/min
- **Endpoint**:
  ```
  GET https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=mxn
  ```
- **Configuración**:
  ```env
  COINGECKO_API_KEY=tu_api_key  # Solo para plan Pro
  ```

#### **d) Binance API (Backup)**
- **URL**: https://www.binance.com/en/binance-api
- **Precio**: GRATIS
- **Endpoint**:
  ```
  GET https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT
  ```

#### **Implementación Recomendada**:
```javascript
// Usar Pyth como primario, CoinGecko como backup
const getSOLtoMXN = async () => {
  try {
    // Intentar Pyth primero
    const pythPrice = await getPythPrice();
    return pythPrice;
  } catch (error) {
    // Fallback a CoinGecko
    const cgPrice = await getCoinGeckoPrice();
    return cgPrice;
  }
};
```

---

### 5. 📱 SMS/Email Provider (Notificaciones)

#### **Para qué sirve**:
- Notificar a usuarios de transacciones
- Confirmaciones de pago
- Alertas de disputas

#### **Opciones**:

#### **a) Twilio (SMS + Email)**
- **URL**: https://www.twilio.com/
- **Precio SMS México**:
  - $0.045 USD por SMS
  - Free trial: $15 USD de crédito
- **Email (SendGrid)**:
  - Free: 100 emails/día
  - Essentials: $19.95/mes - 50k emails
- **Configuración**:
  ```env
  TWILIO_ACCOUNT_SID=tu_account_sid
  TWILIO_AUTH_TOKEN=tu_auth_token
  TWILIO_PHONE_NUMBER=+1234567890
  TWILIO_MESSAGING_SERVICE_SID=tu_service_sid
  ```
- **Docs**: https://www.twilio.com/docs

#### **b) SendGrid (Solo Email)**
- **URL**: https://sendgrid.com/
- **Precio**:
  - Free: 100 emails/día
  - Essentials: $19.95/mes
- **Configuración**:
  ```env
  SENDGRID_API_KEY=tu_api_key
  ```

#### **c) Resend (Email moderno)**
- **URL**: https://resend.com/
- **Precio**:
  - Free: 100 emails/día
  - Pro: $20/mes - 50k emails
- **Features**: Templates con React
- **Configuración**:
  ```env
  RESEND_API_KEY=tu_api_key
  ```

---

### 6. 📊 Analytics & Monitoring

#### **a) Sentry (Error Tracking)**
- **URL**: https://sentry.io/
- **Precio**:
  - Free: 5k errors/mes
  - Team: $26/mes
- **Configuración**:
  ```env
  VITE_SENTRY_DSN=https://...@sentry.io/...
  ```

#### **b) Mixpanel (User Analytics)**
- **URL**: https://mixpanel.com/
- **Precio**:
  - Free: 100k events/mes
  - Growth: $25/mes
- **Configuración**:
  ```env
  VITE_MIXPANEL_TOKEN=tu_token
  ```

---

## 📦 APIs OPCIONALES (Mejoras)

### 7. 🗄️ IPFS/Arweave (Almacenamiento Descentralizado)

#### **Para qué sirve**:
- Almacenar metadata de NFTs KYC
- Evidencia de disputas
- Documentos de verificación

#### **a) NFT.Storage (IPFS - Gratis)**
- **URL**: https://nft.storage/
- **Precio**: GRATIS
- **Docs**: https://nft.storage/docs/

#### **b) Arweave (Permanente)**
- **URL**: https://www.arweave.org/
- **Precio**: ~$5-10 USD por GB (una vez, permanente)
- **Uso con Bundlr**:
  - URL: https://bundlr.network/

---

### 8. 🔔 Push Notifications

#### **OneSignal**
- **URL**: https://onesignal.com/
- **Precio**: Free hasta 10k usuarios
- **Features**: Web push, mobile, email

---

## 💰 Resumen de Costos Mensuales

### Setup Mínimo Viable (Devnet):
```
Solana RPC (Helius Free): $0
STP Sandbox: $0
KYC (Onfido Sandbox): $0
Price Oracle (Pyth): $0
Analytics (Sentry Free): $0
─────────────────────────
TOTAL: $0/mes
```

### Producción Inicial (1,000 usuarios/mes):
```
Helius Growth: $49
STP (100 tx/mes × $4): $400
Onfido (100 KYC): $150
SendGrid Essentials: $20
Sentry Team: $26
─────────────────────────
TOTAL: ~$645/mes
```

### Producción Escalada (10,000 usuarios/mes):
```
Helius Business: $249
STP (1,000 tx/mes × $3.5): $3,500
Onfido (1,000 KYC): $1,500
SendGrid Pro: $90
Sentry Business: $80
Mixpanel Growth: $25
─────────────────────────
TOTAL: ~$5,444/mes
```

---

## 🔑 Archivo .env Completo para Producción

```env
# ============================================
# SOLANA CONFIGURATION
# ============================================
VITE_PROGRAM_ID=TuProgramIDReal
VITE_NETWORK=mainnet-beta
VITE_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_API_KEY

# ============================================
# STP (MEXICAN PAYMENT SYSTEM)
# ============================================
STP_API_URL=https://prod.stpmex.com/speiws/rest
STP_API_KEY=tu_stp_api_key
STP_COMPANY_ID=tu_company_id
STP_PRIVATE_KEY_PATH=/secure/path/to/stp_private.key

# ============================================
# KYC PROVIDER (ONFIDO)
# ============================================
ONFIDO_API_TOKEN=tu_onfido_token
ONFIDO_REGION=us

# ============================================
# PRICE ORACLE (BACKUP)
# ============================================
COINGECKO_API_KEY=tu_coingecko_key

# ============================================
# NOTIFICATIONS
# ============================================
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
SENDGRID_API_KEY=tu_sendgrid_key

# ============================================
# ANALYTICS & MONITORING
# ============================================
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_MIXPANEL_TOKEN=tu_mixpanel_token

# ============================================
# SECURITY
# ============================================
ORACLE_PRIVATE_KEY=tu_oracle_private_key_base58
JWT_SECRET=tu_jwt_secret_super_seguro
API_RATE_LIMIT=100

# ============================================
# SERVER
# ============================================
PORT=3001
NODE_ENV=production
```

---

## 📝 Checklist de Implementación

### Fase 1: MVP (Devnet)
- [x] Solana RPC público
- [x] STP simulado
- [ ] KYC manual (admin aprueba)
- [x] Price oracle básico

### Fase 2: Beta (Testnet/Devnet Real)
- [ ] Solana RPC privado (Helius Free)
- [ ] STP Sandbox real
- [ ] KYC provider integrado (Onfido)
- [ ] Price oracle dual (Pyth + CoinGecko)
- [ ] Email notifications básicas

### Fase 3: Producción (Mainnet)
- [ ] Helius/Alchemy paid plan
- [ ] STP Producción
- [ ] KYC completo con 4 niveles
- [ ] SMS + Email notifications
- [ ] Analytics completo
- [ ] Error tracking
- [ ] Monitoring 24/7

---

## 🆘 Prioridades de Implementación

1. **CRÍTICO** (No funciona sin esto):
   - ✅ Solana RPC
   - ❌ STP API Real
   - ⚠️ Price Oracle

2. **MUY IMPORTANTE** (Funciona pero limitado):
   - KYC Provider
   - Email Notifications
   - Error Tracking

3. **IMPORTANTE** (Mejora UX):
   - SMS Notifications
   - Analytics
   - IPFS Storage

4. **NICE TO HAVE**:
   - Push Notifications
   - Advanced Analytics
   - Multiple payment gateways

---

**Última actualización**: 26 de Octubre 2025
**Contacto**: Para más información sobre integraciones específicas
