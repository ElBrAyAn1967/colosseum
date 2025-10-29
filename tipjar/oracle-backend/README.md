# STP Oracle Backend

Backend del oráculo para verificar pagos STP y actualizar el estado en el programa de Solana.

## Características

- ✅ Verificación automática de pagos STP mediante polling
- ✅ API REST para verificación manual
- ✅ Webhook handler para notificaciones de STP
- ✅ Modo simulación para desarrollo (sin API real de STP)
- ✅ Actualización automática del estado en Solana
- ✅ Liberación automática de fondos tras confirmación

## Instalación

```bash
cd oracle-backend
npm install
```

## Configuración

1. Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Configurar las variables de entorno en `.env`:

```env
# Solana
SOLANA_RPC_URL=http://localhost:8899
SOLANA_NETWORK=devnet
ORACLE_PRIVATE_KEY=tu_clave_privada_en_base58

# Program ID
PROGRAM_ID=4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun

# STP API (cuando tengas acceso)
STP_API_URL=https://api-sandbox.stpmex.com
STP_API_KEY=tu_api_key
STP_COMPANY_ID=tu_company_id

# Server
PORT=3001
NODE_ENV=development
```

## Uso

### Modo Desarrollo (Simulación)

```bash
npm run dev
```

El oráculo iniciará en modo simulación, donde los pagos STP son simulados automáticamente.

### Modo Producción

```bash
npm run build
npm start
```

## API Endpoints

### GET /health
Health check del servicio

```bash
curl http://localhost:3001/health
```

### GET /status
Estado del oráculo

```bash
curl http://localhost:3001/status
```

### POST /verify-order
Verificar manualmente una orden

```bash
curl -X POST http://localhost:3001/verify-order \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_001_SOL"}'
```

### POST /verify-stp-payment
Verificar un pago STP directamente (testing)

```bash
curl -X POST http://localhost:3001/verify-stp-payment \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "STP_TX_12345678"}'
```

### POST /webhook/stp
Webhook para notificaciones de STP

```bash
curl -X POST http://localhost:3001/webhook/stp \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu_secret" \
  -d '{"transactionId": "...", "status": "LIQUIDADA", ...}'
```

### POST /dev/simulate-payment (Solo desarrollo)
Simular procesamiento de pago

```bash
curl -X POST http://localhost:3001/dev/simulate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_001_SOL",
    "stpTransactionId": "STP_TX_12345678"
  }'
```

## Modo Simulación

En modo desarrollo (`NODE_ENV=development`), el oráculo opera en **modo simulación**:

### Comportamiento Simulado

La verificación de pagos STP es simulada basándose en el último carácter del `transactionId`:

- **Dígitos 0-7**: Pago confirmado ✅ (80% probabilidad)
- **Dígito 8**: Pago pendiente ⏳
- **Dígito 9**: Pago rechazado ❌

**Ejemplos:**
```javascript
STP_TX_12345670 // → Confirmado
STP_TX_12345678 // → Pendiente
STP_TX_12345679 // → Rechazado
```

### Migrar a API Real de STP

Cuando tengas acceso a la API real de STP:

1. **Configurar credenciales** en `.env`:
   ```env
   STP_API_URL=https://api.stpmex.com
   STP_API_KEY=tu_api_key_real
   STP_COMPANY_ID=tu_company_id
   NODE_ENV=production
   ```

2. **Implementar llamadas reales** en `src/stp-api.ts`:
   - Descomentar el código de las llamadas HTTP reales
   - Ajustar según la documentación de STP
   - Implementar autenticación y firma de requests

3. **Configurar webhook** en el panel de STP:
   - URL: `https://tu-dominio.com/webhook/stp`
   - Header: `x-webhook-secret: tu_secret`

## Arquitectura

```
┌─────────────────┐
│   STP API       │
│  (Pagos MXN)    │
└────────┬────────┘
         │
         │ HTTP/Webhook
         ▼
┌─────────────────┐
│  Oracle Backend │
│  - Verificación │
│  - Polling      │
│  - API REST     │
└────────┬────────┘
         │
         │ Solana RPC
         ▼
┌─────────────────┐
│ Solana Program  │
│  (Escrow P2P)   │
└─────────────────┘
```

## Flujo de Verificación

1. **Buyer** confirma pago fiat en el frontend → `confirm_fiat_payment()`
2. **Oracle** detecta orden pendiente (polling cada 30s)
3. **Oracle** verifica pago en API de STP
4. **Oracle** actualiza estado en Solana → `update_oracle_status()`
5. **Oracle** libera fondos del escrow → `release_funds_native/spl()`
6. **Buyer** recibe crypto

## Seguridad

### Producción Checklist

- [ ] Usar clave privada segura (no la de desarrollo)
- [ ] Configurar HTTPS para el servidor
- [ ] Validar firma de webhooks de STP
- [ ] Implementar rate limiting en la API
- [ ] Usar secrets manager para credenciales
- [ ] Monitorear logs y errores
- [ ] Configurar alertas para fallos
- [ ] Implementar retry logic robusto

## Troubleshooting

### Error: "Oracle no autorizado"
- Verificar que la clave privada del oráculo sea la misma que la autoridad de la plataforma

### Error: "No se pueden obtener órdenes pendientes"
- Verificar que el RPC de Solana esté accesible
- Verificar que el Program ID sea correcto

### Pagos no se verifican automáticamente
- Verificar que el polling esté activo (`GET /status`)
- Verificar logs del oráculo
- Probar verificación manual con `/verify-order`

## Desarrollo

### Estructura de archivos

```
oracle-backend/
├── src/
│   ├── index.ts           # Entry point
│   ├── config.ts          # Configuración
│   ├── stp-api.ts         # Cliente API STP
│   ├── solana-client.ts   # Cliente Solana
│   ├── oracle-service.ts  # Lógica del oráculo
│   ├── api-server.ts      # API REST
│   └── idl.json           # IDL del programa (generado)
├── .env                   # Variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts disponibles

```bash
npm run dev      # Desarrollo con auto-reload
npm run build    # Compilar TypeScript
npm start        # Producción
npm run watch    # Watch mode
```

## Licencia

MIT
