# 🔐 Guía de Variables de Entorno - Solanita P2P

Esta guía explica todas las variables de entorno necesarias para el proyecto.

---

## 📋 Resumen de Variables

| Componente | Archivo | Variables Requeridas |
|------------|---------|---------------------|
| Frontend | `.env` | 2 variables |
| Oracle Backend | `.env` | 5-8 variables |

---

## 🎨 Frontend (tipjar-frontend)

### Ubicación
`/home/Brayan-sol/solanita/tipjar-frontend/.env`

### Variables Requeridas

```env
# Program ID del programa Solana deployed
VITE_PROGRAM_ID=5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K

# Red de Solana (devnet, testnet, mainnet-beta)
VITE_NETWORK=devnet
```

### Variables Opcionales

```env
# URL del RPC personalizado (si no se configura, usa endpoints públicos)
VITE_RPC_URL=https://api.devnet.solana.com

# Para mainnet, usa un RPC privado:
# VITE_RPC_URL=https://your-private-rpc.solana.com
```

### Cómo Obtener el Program ID

1. Deploy del programa:
   ```bash
   cd /home/Brayan-sol/solanita/tipjar
   anchor deploy
   ```

2. El output mostrará:
   ```
   Program Id: 5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K
   ```

3. Copia ese ID a tu `.env`

### Ejemplo Completo (.env)

```env
VITE_PROGRAM_ID=5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K
VITE_NETWORK=devnet
```

---

## 🔧 Oracle Backend (tipjar/oracle-backend)

### Ubicación
`/home/Brayan-sol/solanita/tipjar/oracle-backend/.env`

### Variables Requeridas (Devnet)

```env
# URL del RPC de Solana
SOLANA_RPC_URL=https://api.devnet.solana.com

# Red de Solana
SOLANA_NETWORK=devnet

# Program ID (el mismo que en el frontend)
PROGRAM_ID=5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K

# Private key del oracle (en base58)
ORACLE_PRIVATE_KEY=tu_private_key_base58_aqui

# Puerto del servidor
PORT=3001
```

### Cómo Obtener ORACLE_PRIVATE_KEY

#### Opción 1: Crear nuevo keypair

```bash
# Crear keypair
solana-keygen new --outfile ~/oracle-keypair.json

# Ver la private key en base58
solana-keygen pubkey ~/oracle-keypair.json  # Esto muestra la public key

# Para obtener la private key en base58, usa:
cat ~/oracle-keypair.json
# Copia el array de números y conviértelo a base58 usando una herramienta
```

#### Opción 2: Usar keypair existente

```bash
# Si ya tienes una wallet
solana-keygen pubkey ~/.config/solana/id.json
```

**IMPORTANTE**: El keypair del oracle debe tener SOL en devnet:

```bash
# Obtener SOL gratis en devnet
solana airdrop 2 $(solana-keygen pubkey ~/oracle-keypair.json)

# Verificar balance
solana balance $(solana-keygen pubkey ~/oracle-keypair.json)
```

### Variables Opcionales (Producción)

```env
# Configuración de STP (cuando tengas API real)
STP_API_URL=https://demo.stpmex.com/speiws/rest
STP_API_KEY=tu_api_key_de_stp
STP_COMPANY_ID=tu_company_id

# Webhook security
WEBHOOK_SECRET=un_secret_random_seguro

# Intervalo de polling (en milisegundos)
POLLING_INTERVAL_MS=30000

# Modo de desarrollo
NODE_ENV=development
```

### Ejemplo Completo (.env para Devnet)

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID=5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K

# Oracle Keypair (private key en base58)
ORACLE_PRIVATE_KEY=5J7W...abc123

# Server
PORT=3001
NODE_ENV=development

# STP API (simulado por ahora)
# STP_API_URL=https://demo.stpmex.com/speiws/rest
# STP_API_KEY=your_key
# STP_COMPANY_ID=your_id

# Polling
POLLING_INTERVAL_MS=30000

# Webhook
WEBHOOK_SECRET=mi_secret_super_seguro_123
```

---

## 🌐 Variables de Entorno en Vercel

### Configurar en Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Agrega cada variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_PROGRAM_ID` | Tu Program ID | Production, Preview, Development |
| `VITE_NETWORK` | `devnet` o `mainnet-beta` | Production |
| `VITE_NETWORK` | `devnet` | Preview, Development |

### Diferentes Valores por Ambiente

Puedes tener diferentes valores para:

- **Production**: Mainnet, RPC privado
- **Preview**: Devnet para testing
- **Development**: Localhost o devnet

**Ejemplo**:

```
Production:
  VITE_PROGRAM_ID=MainnetProgramId123
  VITE_NETWORK=mainnet-beta
  VITE_RPC_URL=https://private-rpc.com

Preview/Development:
  VITE_PROGRAM_ID=DevnetProgramId456
  VITE_NETWORK=devnet
```

---

## ⚠️ Seguridad: Qué NO Hacer

### ❌ NUNCA Subir a GitHub

**NO SUBAS ESTOS ARCHIVOS**:
- `.env`
- `.env.local`
- `.env.production`
- `*-keypair.json`
- Archivos con private keys

### ✅ Verifica tu .gitignore

Asegúrate que `.gitignore` incluya:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
**/.env

# Keypairs
*-keypair.json
*.json
!package.json
!tsconfig.json
```

### 🔒 Mejores Prácticas

1. **Usa archivos .env.example**:
   - Commitea `.env.example` (sin valores reales)
   - NO commitees `.env`

2. **Diferencia entre ambientes**:
   - Devnet para desarrollo
   - Mainnet solo para producción
   - NUNCA uses la misma private key en ambos

3. **Rota las keys regularmente**:
   - Especialmente en producción
   - Si sospechas que una key se comprometió

4. **Usa secretos seguros**:
   - WEBHOOK_SECRET: Mínimo 32 caracteres random
   - Generador: `openssl rand -hex 32`

---

## 🔄 Actualizar Variables de Entorno

### En Local (Desarrollo)

```bash
# 1. Edita el archivo .env
nano /home/Brayan-sol/solanita/tipjar-frontend/.env

# 2. Guarda los cambios

# 3. Reinicia el servidor dev
npm run dev
```

### En Vercel (Producción)

```bash
# Opción 1: Desde Dashboard
1. Vercel Dashboard → Settings → Environment Variables
2. Edit o Delete la variable
3. Redeploy: Deployments → Latest → Redeploy

# Opción 2: Desde CLI (si tienes Vercel CLI)
vercel env add VITE_PROGRAM_ID
vercel --prod
```

**IMPORTANTE**: Después de cambiar variables en Vercel, debes **redeploy** para que tomen efecto.

---

## 📝 Checklist de Variables

### Frontend (.env)
- [ ] `VITE_PROGRAM_ID` configurado
- [ ] `VITE_NETWORK` configurado (devnet o mainnet-beta)
- [ ] (Opcional) `VITE_RPC_URL` si usas RPC privado

### Oracle Backend (.env)
- [ ] `SOLANA_RPC_URL` configurado
- [ ] `SOLANA_NETWORK` configurado
- [ ] `PROGRAM_ID` configurado (mismo que frontend)
- [ ] `ORACLE_PRIVATE_KEY` configurado
- [ ] Oracle wallet tiene SOL suficiente
- [ ] `PORT` configurado (3001)
- [ ] (Opcional) Variables de STP si usas API real

### Vercel
- [ ] `VITE_PROGRAM_ID` agregado en Vercel
- [ ] `VITE_NETWORK` agregado en Vercel
- [ ] Valores correctos para cada ambiente (Production/Preview)

### Seguridad
- [ ] Archivo `.env` en `.gitignore`
- [ ] Archivo `.env.example` commiteado (sin valores reales)
- [ ] Private keys NO están en el código fuente
- [ ] No hay variables hardcodeadas en el código

---

## 🆘 Troubleshooting

### Error: "Environment variable not found"

**Problema**: La aplicación no encuentra `VITE_PROGRAM_ID`

**Solución**:
```bash
# 1. Verifica que existe
cat tipjar-frontend/.env

# 2. Verifica el formato (sin espacios extra)
VITE_PROGRAM_ID=5xKN...  # ✅ Correcto
VITE_PROGRAM_ID = 5xKN... # ❌ Incorrecto (espacio)

# 3. Reinicia el dev server
npm run dev
```

### Error: "Invalid Program ID"

**Problema**: El Program ID es inválido

**Solución**:
```bash
# Verifica que sea un Program ID válido (base58, ~44 caracteres)
# Debe verse algo como: 5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K

# Verifica en Solana Explorer:
# https://explorer.solana.com/address/TU_PROGRAM_ID?cluster=devnet
```

### Vercel: Variables no funcionan después de agregarlas

**Problema**: Agregaste variables pero no se aplican

**Solución**:
```
1. Settings → Deployments
2. Click en el último deployment
3. Click en "..." (tres puntos)
4. Selecciona "Redeploy"
5. Marca "Use existing Build Cache" si quieres más rápido
6. Click "Redeploy"
```

---

## 📞 Comandos Rápidos

```bash
# Ver archivo .env
cat tipjar-frontend/.env

# Editar .env
nano tipjar-frontend/.env

# Verificar que .env está en .gitignore
git check-ignore .env  # Debe mostrar: .env

# Ver si .env fue commiteado por error
git ls-files | grep .env  # No debe mostrar nada

# Crear .env desde .env.example
cp tipjar-frontend/.env.example tipjar-frontend/.env
# Luego edita y agrega los valores reales
```

---

**Última actualización**: 26 de Octubre 2025

¡Recuerda nunca commitear tus archivos `.env` con valores reales! 🔐
