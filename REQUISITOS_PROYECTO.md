# 📋 Lista de Requisitos para el Proyecto Solanita P2P

## ✅ Estado del Proyecto

**PROGRAMA SOLANA: ✅ COMPILADO CORRECTAMENTE**

---

## 🛠️ Software y Herramientas Necesarias

### 1. **Solana CLI** (REQUERIDO)
- **Versión**: 1.18.x o superior
- **Instalación**:
  ```bash
  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
  ```
- **Verificar**:
  ```bash
  solana --version
  ```
- **Configuración Devnet**:
  ```bash
  solana config set --url https://api.devnet.solana.com
  ```

### 2. **Anchor CLI** (REQUERIDO)
- **Versión**: 0.32.1
- **Instalación**:
  ```bash
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
  avm install 0.32.1
  avm use 0.32.1
  ```
- **Verificar**:
  ```bash
  anchor --version
  ```

### 3. **Rust** (REQUERIDO)
- **Versión**: 1.75.0 o superior
- **Instalación**:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup default stable
  ```
- **Verificar**:
  ```bash
  rustc --version
  cargo --version
  ```

### 4. **Node.js y npm** (REQUERIDO)
- **Versión**: Node.js 18.x o superior
- **Instalación**: https://nodejs.org/
- **Verificar**:
  ```bash
  node --version
  npm --version
  ```

### 5. **Git** (REQUERIDO)
- **Instalación**: https://git-scm.com/downloads
- **Verificar**:
  ```bash
  git --version
  ```

---

## 💰 Recursos Necesarios

### 1. **Wallet de Solana** (REQUERIDO)
- **Crear nueva wallet**:
  ```bash
  solana-keygen new --outfile ~/.config/solana/id.json
  ```
- **Ver tu dirección pública**:
  ```bash
  solana address
  ```
- **IMPORTANTE**: Guarda tu seed phrase en un lugar seguro

### 2. **SOL en Devnet** (REQUERIDO para deployment)
- **Obtener SOL gratis en Devnet**:
  ```bash
  solana airdrop 2
  ```
- **Verificar balance**:
  ```bash
  solana balance
  ```
- **Necesitas al menos**: 5-10 SOL en devnet para deployment

---

## 📦 Dependencias del Proyecto

### **Backend del Programa Solana** ✅ INSTALADAS
- ✅ `anchor-lang = "0.32.1"`
- ✅ `anchor-spl = "0.32.1"`

### **Frontend React**
Necesitas instalar las dependencias navegando a `/home/Brayan-sol/solanita/tipjar-frontend`:

```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
npm install
```

**Dependencias principales que se instalarán**:
- `@coral-xyz/anchor` - Framework Anchor para Solana
- `@solana/web3.js` - SDK de Solana
- `@solana/wallet-adapter-react` - Adaptador de wallets
- `@solana/wallet-adapter-wallets` - Wallets soportadas
- `react` - Framework UI
- `tailwindcss` - CSS framework
- Y más...

### **Oracle Backend**
Necesitas instalar las dependencias navegando a `/home/Brayan-sol/solanita/tipjar/oracle-backend`:

```bash
cd /home/Brayan-sol/solanita/tipjar/oracle-backend
npm install
```

**Dependencias principales**:
- `express` - Servidor API
- `@coral-xyz/anchor` - Framework Anchor
- `@solana/web3.js` - SDK de Solana
- Y más...

---

## 🔧 Configuración Necesaria

### 1. **Archivo Anchor.toml** ✅ EXISTE
- Ubicación: `/home/Brayan-sol/solanita/tipjar/Anchor.toml`
- **DEBES ACTUALIZAR después del deployment**:
  - `[programs.localnet]` - Reemplazar con tu Program ID
  - `[programs.devnet]` - Reemplazar con tu Program ID

### 2. **Variables de Entorno del Frontend**
- Archivo: `/home/Brayan-sol/solanita/tipjar-frontend/.env`
- **Crear el archivo con**:
  ```env
  VITE_PROGRAM_ID=<TU_PROGRAM_ID_AQUI>
  VITE_NETWORK=devnet
  ```

### 3. **Variables de Entorno del Oracle**
- Archivo: `/home/Brayan-sol/solanita/tipjar/oracle-backend/.env`
- **Crear el archivo con**:
  ```env
  SOLANA_RPC_URL=https://api.devnet.solana.com
  PROGRAM_ID=<TU_PROGRAM_ID_AQUI>
  ORACLE_KEYPAIR_PATH=/ruta/a/tu/oracle-keypair.json
  STP_API_KEY=<CUANDO_TENGAS_API_REAL>
  STP_API_URL=https://demo.stpmex.com/speiws/rest
  PORT=3001
  ```

### 4. **Keypair del Oracle** (CREAR)
```bash
solana-keygen new --outfile ~/oracle-keypair.json
# Fondear con SOL de devnet
solana airdrop 2 $(solana-keygen pubkey ~/oracle-keypair.json)
```

---

## 📁 Archivos Críticos del Proyecto

### ✅ **Archivos que YA EXISTEN**

1. **Programa Principal Solana**:
   - `/home/Brayan-sol/solanita/tipjar/programs/tipjar/src/lib.rs` ✅
   - `/home/Brayan-sol/solanita/tipjar/programs/tipjar/Cargo.toml` ✅

2. **Tests del Programa**:
   - `/home/Brayan-sol/solanita/tipjar/tests/tipjar.ts` ✅

3. **IDL Generado**:
   - `/home/Brayan-sol/solanita/tipjar/target/idl/tipjar.json` ✅

4. **Frontend Completo**:
   - `/home/Brayan-sol/solanita/tipjar-frontend/src/App.jsx` ✅
   - `/home/Brayan-sol/solanita/tipjar-frontend/src/hooks/useP2PProgram.js` ✅
   - `/home/Brayan-sol/solanita/tipjar-frontend/src/components/*.jsx` ✅ (7 componentes)

5. **Oracle Backend**:
   - `/home/Brayan-sol/solanita/tipjar/oracle-backend/src/*.ts` ✅

### ⚠️ **Archivos que DEBES CREAR**

1. **Frontend .env**:
   ```bash
   touch /home/Brayan-sol/solanita/tipjar-frontend/.env
   ```

2. **Oracle .env**:
   ```bash
   touch /home/Brayan-sol/solanita/tipjar/oracle-backend/.env
   ```

3. **Oracle Keypair** (si no existe):
   ```bash
   solana-keygen new --outfile ~/oracle-keypair.json
   ```

---

## 🚀 Pasos para Deployment

### **Paso 1: Build del Programa** ✅ COMPLETADO
```bash
cd /home/Brayan-sol/solanita/tipjar
anchor build
```

### **Paso 2: Deploy a Devnet**
```bash
anchor deploy
```
**Resultado**: Obtendrás un **Program ID** (ej: `5xKN...xyz`)

### **Paso 3: Actualizar Program ID en todos los archivos**

1. **Anchor.toml**:
   ```toml
   [programs.devnet]
   tipjar = "TU_PROGRAM_ID_AQUI"
   ```

2. **Frontend .env**:
   ```env
   VITE_PROGRAM_ID=TU_PROGRAM_ID_AQUI
   ```

3. **Frontend useP2PProgram.js** (línea ~10):
   ```javascript
   const PROGRAM_ID = new PublicKey('TU_PROGRAM_ID_AQUI');
   ```

4. **Oracle .env**:
   ```env
   PROGRAM_ID=TU_PROGRAM_ID_AQUI
   ```

### **Paso 4: Copiar IDL al Frontend**
```bash
mkdir -p /home/Brayan-sol/solanita/tipjar-frontend/src/idl
cp /home/Brayan-sol/solanita/tipjar/target/idl/tipjar.json \
   /home/Brayan-sol/solanita/tipjar-frontend/src/idl/tipjar.json
```

### **Paso 5: Instalar Dependencias**

**Frontend**:
```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
npm install
```

**Oracle**:
```bash
cd /home/Brayan-sol/solanita/tipjar/oracle-backend
npm install
```

### **Paso 6: Inicializar la Plataforma**

Necesitas ejecutar la función `initialize_platform` una sola vez. Puedes usar el test o crear un script:

```bash
cd /home/Brayan-sol/solanita/tipjar
anchor test --skip-local-validator
```

O crear un script de inicialización.

### **Paso 7: Iniciar Servicios**

**Terminal 1 - Oracle Backend**:
```bash
cd /home/Brayan-sol/solanita/tipjar/oracle-backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
npm run dev
```

**Terminal 3 - Polling Service del Oracle**:
```bash
cd /home/Brayan-sol/solanita/tipjar/oracle-backend
npm run poll
```

---

## 🔐 Wallets del Usuario (Browser Extensions)

Para que los usuarios puedan conectarse al frontend, necesitan instalar una wallet de Solana:

### **Wallets Soportadas**:
1. **Phantom** - https://phantom.app/ (RECOMENDADA)
2. **Solflare** - https://solflare.com/
3. **Backpack** - https://backpack.app/
4. **Slope** - https://slope.finance/

**Configuración**:
- Instalar extensión del navegador
- Crear/importar wallet
- Cambiar red a **Devnet**
- Obtener SOL de devnet gratis

---

## 🧪 Testing

### **Tests del Programa Solana**:
```bash
cd /home/Brayan-sol/solanita/tipjar
anchor test
```

### **Tests Específicos**:
```bash
anchor test --skip-local-validator  # Usar devnet
```

---

## 📊 Tokens de Prueba (Devnet)

Para probar con USDC/USDT en devnet, necesitas:

1. **Crear tokens SPL de prueba**:
   ```bash
   spl-token create-token
   spl-token create-account <TOKEN_MINT>
   spl-token mint <TOKEN_MINT> 1000000
   ```

2. **O usar faucets de devnet**:
   - USDC Devnet: https://spl-token-faucet.com/

---

## 🔑 Claves y Secretos IMPORTANTES

### **NUNCA SUBIR A GIT**:
- ❌ Archivos `.env`
- ❌ Archivos `*-keypair.json`
- ❌ Seed phrases
- ❌ Private keys

### **Archivos .gitignore** (Verificar):
```gitignore
.env
*.json
!package.json
!tsconfig.json
!Anchor.toml
**/node_modules/
target/
.anchor/
```

---

## 📚 Recursos Adicionales

### **Documentación**:
- Solana Docs: https://docs.solana.com/
- Anchor Docs: https://www.anchor-lang.com/
- Solana Cookbook: https://solanacookbook.com/

### **Exploradores**:
- Devnet Explorer: https://explorer.solana.com/?cluster=devnet
- Solscan Devnet: https://solscan.io/?cluster=devnet

### **Faucets**:
- Solana Devnet Faucet: https://faucet.solana.com/
- SPL Token Faucet: https://spl-token-faucet.com/

---

## ✅ Checklist Pre-Launch

Antes de iniciar el proyecto, verifica:

- [ ] Solana CLI instalado y configurado
- [ ] Anchor CLI versión 0.32.1
- [ ] Rust instalado
- [ ] Node.js 18+ instalado
- [ ] Wallet de Solana creada
- [ ] Al menos 5 SOL en devnet
- [ ] Programa deployed a devnet
- [ ] Program ID actualizado en todos los archivos
- [ ] IDL copiado al frontend
- [ ] Variables de entorno configuradas (.env)
- [ ] Dependencias npm instaladas (frontend y oracle)
- [ ] Oracle keypair creado y fondeado
- [ ] Plataforma inicializada (initialize_platform)
- [ ] Wallet browser extension instalada (Phantom/Solflare)

---

## 🆘 Troubleshooting Común

### **Error: "Program ID mismatch"**
- Actualiza el Program ID en Anchor.toml, .env, y useP2PProgram.js

### **Error: "Insufficient funds"**
- Ejecuta `solana airdrop 2` para obtener más SOL

### **Error: "Cannot find module '@coral-xyz/anchor'"**
- Ejecuta `npm install` en el directorio correspondiente

### **Frontend no conecta wallet**
- Verifica que la wallet esté en modo Devnet
- Recarga la página
- Verifica consola del navegador para errores

### **Oracle no verifica pagos**
- Verifica que el oracle-backend esté corriendo
- Verifica el .env del oracle
- Asegúrate que el oracle keypair tenga SOL

---

## 📞 Próximos Pasos

1. **Instalar todas las herramientas** listadas arriba
2. **Crear wallet y obtener SOL en devnet**
3. **Deploy del programa a devnet**
4. **Actualizar Program ID en todos los archivos**
5. **Instalar dependencias npm**
6. **Configurar variables de entorno**
7. **Inicializar la plataforma**
8. **Iniciar servicios (oracle y frontend)**
9. **Probar el flujo completo**

---

## 🎯 Estado Actual del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Programa Solana | ✅ COMPILADO | lib.rs listo, sin errores |
| IDL Generado | ✅ COMPLETO | tipjar.json generado |
| Tests Anchor | ✅ CREADOS | 7 test suites completos |
| Frontend React | ✅ COMPLETO | 7 componentes + hook |
| Oracle Backend | ✅ COMPLETO | Simulación STP funcionando |
| KYC NFT System | ✅ COMPLETO | Programa separado creado |
| Documentación | ✅ COMPLETA | 4 archivos de docs |
| **Deployment** | ⏳ PENDIENTE | Necesita deploy a devnet |
| **Testing E2E** | ⏳ PENDIENTE | Después del deployment |

---

**Última actualización**: 26 de Octubre 2025
**Versión del Programa**: v0.1.0
**Anchor Version**: 0.32.1
