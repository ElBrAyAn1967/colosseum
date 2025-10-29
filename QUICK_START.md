# 🚀 Quick Start - Sistema P2P

## ⚡ Inicio Rápido (5 minutos)

### 1. Compilar el Programa

```bash
cd /home/Brayan-sol/solanita/tipjar

# Instalar dependencias
npm install

# Compilar programa Solana
anchor build

# IMPORTANTE: Después de compilar, anchor genera el IDL
# Copiar el IDL al oráculo:
cp target/idl/tipjar.json oracle-backend/src/idl.json
```

### 2. Ejecutar Tests

```bash
# Tests completos
anchor test

# Esto ejecutará:
# ✅ Inicialización de plataforma
# ✅ Creación de usuarios con KYC
# ✅ Flujo completo SOL y USDC
# ✅ Disputas con split 50/50
# ✅ Cancelaciones
# ✅ Validaciones de límites
```

### 3. Deploy Local

```bash
# Terminal 1: Validador local
solana-test-validator

# Terminal 2: Deploy
anchor deploy --provider.cluster localnet

# Terminal 3: Inicializar
anchor run initialize
```

### 4. Iniciar Oráculo STP

```bash
cd oracle-backend

# Instalar
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tu configuración

# Iniciar en modo desarrollo (simulación)
npm run dev

# El oráculo iniciará en http://localhost:3001
# Verificar: curl http://localhost:3001/health
```

### 5. Iniciar Frontend

```bash
cd ../tipjar-frontend

# Instalar
npm install

# Configurar .env
echo 'VITE_SOLANA_NETWORK=devnet' > .env
echo 'VITE_RPC_URL=http://localhost:8899' >> .env
echo 'VITE_PROGRAM_ID=<tu_program_id>' >> .env

# Iniciar
npm run dev

# Abrir http://localhost:5173
```

---

## 📋 Checklist Post-Deploy

Después de hacer `anchor deploy`, actualiza el Program ID en:

- [ ] [lib.rs:3](file:///home/Brayan-sol/solanita/tipjar/programs/tipjar/src/lib.rs#L3) - `declare_id!()`
- [ ] `Anchor.toml` - sección `[programs.devnet]`
- [ ] `oracle-backend/.env` - `PROGRAM_ID=`
- [ ] `tipjar-frontend/.env` - `VITE_PROGRAM_ID=`

Luego recompila:
```bash
anchor build
```

---

## 🧪 Probar el Sistema Completo

### Flujo E2E Manual:

1. **Crear perfil de seller** (con KYC):
```typescript
await program.methods
  .createUserProfile(true, null)
  .accounts({ ... })
  .rpc();
```

2. **Crear orden** (seller vende 0.5 SOL por 2,000 MXN):
```typescript
await program.methods
  .createOrder(
    "ORDER_001",
    new BN(0.5 * LAMPORTS_PER_SOL),
    new BN(2_000_000_000),
    { sol: {} },
    { stp: {} },
    "STP_REF_001"
  )
  .accounts({ ... })
  .rpc();
```

3. **Buyer acepta orden**:
```typescript
await program.methods
  .acceptOrder()
  .accounts({ ... })
  .rpc();
```

4. **Seller deposita en escrow**:
```typescript
await program.methods
  .depositToEscrowNative()
  .accounts({ ... })
  .rpc();
```

5. **Buyer confirma pago MXN**:
```typescript
await program.methods
  .confirmFiatPayment("STP_TX_12345678")
  .accounts({ ... })
  .rpc();
```

6. **Oracle verifica (automático cada 30s)**:
   - El oráculo detecta la orden
   - Verifica el pago en STP (simulado)
   - Actualiza el estado en Solana
   - Libera los fondos al buyer

7. **¡Completado!** ✅

---

## 🐛 Problemas Comunes

### "Program ID mismatch"
```bash
# Actualizar Program ID en todos los archivos
# Luego: anchor build
```

### "Account not found"
```bash
# Inicializar la plataforma primero
anchor run initialize
```

### Oracle no funciona
```bash
# 1. Verificar que esté corriendo
curl http://localhost:3001/status

# 2. Copiar IDL actualizado
cp target/idl/tipjar.json oracle-backend/src/idl.json

# 3. Reiniciar oráculo
cd oracle-backend && npm run dev
```

### Tests fallan por tipos TypeScript
```bash
# El IDL debe generarse después de compilar
anchor build

# Si persiste, instalar dependencias:
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

---

## 📝 Archivos Importantes

### Programa Principal
- [lib.rs](file:///home/Brayan-sol/solanita/tipjar/programs/tipjar/src/lib.rs) - Programa Solana

### Tests
- [tipjar.ts](file:///home/Brayan-sol/solanita/tipjar/tests/tipjar.ts) - Tests completos

### Oracle
- [oracle-backend/src/index.ts](file:///home/Brayan-sol/solanita/tipjar/oracle-backend/src/index.ts) - Entry point
- [oracle-backend/src/stp-api.ts](file:///home/Brayan-sol/solanita/tipjar/oracle-backend/src/stp-api.ts) - API STP (simulada)

### Sistema KYC
- [kyc-nft-system/programs/kyc-nft/src/lib.rs](file:///home/Brayan-sol/solanita/tipjar/kyc-nft-system/programs/kyc-nft/src/lib.rs)

### Frontend
- [tipjar-frontend/src/hooks/useP2PProgram.ts](file:///home/Brayan-sol/solanita/tipjar-frontend/src/hooks/useP2PProgram.ts)
- [tipjar-frontend/src/components/OrderBook.tsx](file:///home/Brayan-sol/solanita/tipjar-frontend/src/components/OrderBook.tsx)

---

## 🎯 Próximos Pasos

1. **Leer documentación completa**: [COMPLETE_DOCUMENTATION.md](file:///home/Brayan-sol/solanita/COMPLETE_DOCUMENTATION.md)

2. **Deploy a Devnet**:
```bash
solana config set --url devnet
anchor build
anchor deploy
```

3. **Configurar API real de STP**:
   - Obtener credenciales en https://www.stpmex.com/
   - Actualizar `oracle-backend/src/stp-api.ts`
   - Cambiar `NODE_ENV=production`

4. **Implementar KYC real**:
   - Integrar con Onfido/Truora
   - Ver guía en: [kyc-nft-system/README.md](file:///home/Brayan-sol/solanita/tipjar/kyc-nft-system/README.md)

5. **Deploy a producción**:
   - Auditoría de seguridad
   - Deploy a mainnet
   - Configurar monitoreo

---

## 📚 Recursos

- **Documentación completa**: [COMPLETE_DOCUMENTATION.md](file:///home/Brayan-sol/solanita/COMPLETE_DOCUMENTATION.md)
- **Oracle README**: [oracle-backend/README.md](file:///home/Brayan-sol/solanita/tipjar/oracle-backend/README.md)
- **KYC README**: [kyc-nft-system/README.md](file:///home/Brayan-sol/solanita/tipjar/kyc-nft-system/README.md)

---

## ✅ Todo Listo!

El sistema está completamente funcional con:
- ✅ Programa Solana con escrow, disputas y KYC
- ✅ Oracle STP con simulación
- ✅ Sistema de NFTs KYC
- ✅ Frontend React
- ✅ Tests exhaustivos (7 suites, 15+ tests)
- ✅ Documentación completa

**¡Disfruta construyendo! 🚀**
