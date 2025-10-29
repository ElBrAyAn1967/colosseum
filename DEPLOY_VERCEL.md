# 🚀 Guía de Deployment en Vercel - Solanita P2P

Esta guía te llevará paso a paso para deployar el frontend de Solanita P2P en Vercel.

---

## 📋 Prerequisitos

Antes de empezar, asegúrate de tener:

- ✅ Cuenta en GitHub
- ✅ Cuenta en Vercel (puedes usar tu cuenta de GitHub)
- ✅ Programa Solana deployed en devnet
- ✅ Program ID del programa deployed

---

## 🔧 Parte 1: Preparación del Proyecto

### 1.1 Deploy del Programa Solana (Si aún no lo has hecho)

```bash
cd /home/Brayan-sol/solanita/tipjar
anchor deploy
```

**Resultado**: Obtendrás un Program ID como: `5xKN...xyz`

**IMPORTANTE**: Guarda este Program ID, lo necesitarás más adelante.

### 1.2 Actualizar Program ID en el Frontend

Antes de subir a GitHub, actualiza el Program ID en:

**Archivo**: `tipjar-frontend/src/hooks/useP2PProgram.js`

```javascript
// Busca esta línea (alrededor de la línea 10):
const PROGRAM_ID = new PublicKey('TU_PROGRAM_ID_AQUI');

// Reemplázala con tu Program ID real:
const PROGRAM_ID = new PublicKey('5xKN...xyz'); // Tu Program ID
```

### 1.3 Verificar que el IDL esté copiado

```bash
# El IDL debe estar en:
ls -la /home/Brayan-sol/solanita/tipjar-frontend/src/idl/tipjar.json

# Si no existe, cópialo:
mkdir -p /home/Brayan-sol/solanita/tipjar-frontend/src/idl
cp /home/Brayan-sol/solanita/tipjar/target/idl/tipjar.json \
   /home/Brayan-sol/solanita/tipjar-frontend/src/idl/tipjar.json
```

---

## 📦 Parte 2: Subir a GitHub

### 2.1 Inicializar Git (Si no lo has hecho)

```bash
cd /home/Brayan-sol/solanita

# Inicializar repositorio
git init

# Verificar que .gitignore esté configurado
cat .gitignore

# Agregar todos los archivos
git add .

# Hacer primer commit
git commit -m "Initial commit: Solanita P2P Payment System"
```

### 2.2 Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `solanita-p2p` (o el que prefieras)
3. Descripción: "Cross-border P2P payment system on Solana"
4. **NO** marques "Initialize with README" (ya tienes archivos)
5. Click en "Create repository"

### 2.3 Conectar y Push a GitHub

```bash
# Agregar remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/solanita-p2p.git

# Cambiar a branch main
git branch -M main

# Push inicial
git push -u origin main
```

**IMPORTANTE**: Si GitHub te pide autenticación, usa un Personal Access Token en lugar de password.

---

## 🌐 Parte 3: Deploy en Vercel

### 3.1 Conectar Vercel con GitHub

1. Ve a https://vercel.com/
2. Click en "Sign Up" o "Log In"
3. Selecciona "Continue with GitHub"
4. Autoriza a Vercel para acceder a tus repositorios

### 3.2 Importar Proyecto

1. En el Dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Busca tu repositorio `solanita-p2p`
3. Click en **"Import"**

### 3.3 Configurar el Proyecto

En la página de configuración:

#### **Framework Preset**:
- Selecciona: **Vite**

#### **Root Directory**:
- Click en **"Edit"**
- Selecciona: `tipjar-frontend`
- Click en **"Continue"**

#### **Build & Output Settings**:
- Build Command: `npm run build` (ya está configurado)
- Output Directory: `dist` (ya está configurado)
- Install Command: `npm install` (ya está configurado)

### 3.4 Configurar Variables de Entorno

**MUY IMPORTANTE**: Antes de hacer deploy, configura las variables de entorno.

1. En la sección **"Environment Variables"**, agrega:

| Name | Value | Descripción |
|------|-------|-------------|
| `VITE_PROGRAM_ID` | `TU_PROGRAM_ID_AQUI` | El Program ID de tu programa deployed |
| `VITE_NETWORK` | `devnet` | Red de Solana (devnet, testnet, mainnet-beta) |

**Ejemplo**:
```
VITE_PROGRAM_ID=5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K
VITE_NETWORK=devnet
```

2. Click en **"Add"** después de cada variable

### 3.5 Deploy

1. Click en **"Deploy"**
2. Vercel comenzará a buildear tu proyecto
3. Espera 2-3 minutos (primera vez puede tardar más)

---

## ✅ Parte 4: Verificación

### 4.1 Check del Deploy

Una vez completado el deploy:

1. Vercel te mostrará: **"Congratulations! Your project has been deployed"**
2. Verás una URL como: `https://solanita-p2p-abc123.vercel.app`
3. Click en **"Visit"** para ver tu aplicación

### 4.2 Probar la Aplicación

1. **Verifica que cargue la página**:
   - Deberías ver el Welcome Page de Solanita P2P
   - Logo y título visibles
   - Botón "Connect Wallet"

2. **Conecta una wallet**:
   - Click en "Select Wallet"
   - Selecciona Phantom/Solflare
   - Aprueba la conexión
   - **IMPORTANTE**: Asegúrate que la wallet esté en **Devnet**

3. **Verifica la conexión**:
   - Deberías ver tu dirección de wallet
   - Deberías ver las opciones del menú (Marketplace, My Orders, etc.)

4. **Check de la consola del navegador**:
   - Presiona F12 → Console
   - NO deberían aparecer errores relacionados con:
     - Program ID
     - RPC connection
     - IDL not found

### 4.3 Solución de Problemas Comunes

#### ❌ Error: "Program ID not found"
**Solución**:
- Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
- Verifica que `VITE_PROGRAM_ID` esté correctamente configurado
- Redeploy: Settings → Deployments → Latest → "Redeploy"

#### ❌ Error: "Cannot read properties of undefined (reading 'idl')"
**Solución**:
- El IDL no está en el proyecto
- Copia el IDL: `cp tipjar/target/idl/tipjar.json tipjar-frontend/src/idl/`
- Push a GitHub: `git add . && git commit -m "Add IDL" && git push`
- Vercel auto-deployará

#### ❌ Error: "Failed to fetch" en RPC
**Solución**:
- La wallet puede estar en mainnet
- Cambia la wallet a Devnet
- O agrega `VITE_RPC_URL` en variables de entorno

#### ❌ Build falla en Vercel
**Solución**:
- Ve a Vercel → Deployments → Failed Deployment → View Build Logs
- Busca errores específicos
- Comunes:
  - Missing dependencies: `npm install` faltante
  - TypeScript errors: Verifica que no haya errores de tipo

---

## 🔄 Parte 5: Actualizaciones Futuras

### 5.1 Actualizar el Código

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios en el código
# 2. Add y commit
git add .
git commit -m "Descripción de los cambios"

# 3. Push a GitHub
git push

# 4. Vercel auto-deployará los cambios
```

**Vercel detecta automáticamente los cambios** y redeploya.

### 5.2 Ver Deployments Anteriores

1. Vercel Dashboard → Tu Proyecto → Deployments
2. Puedes ver todos los deploys históricos
3. Puedes hacer rollback a versiones anteriores

### 5.3 Configurar Dominio Personalizado (Opcional)

Si tienes un dominio:

1. Vercel Dashboard → Tu Proyecto → Settings → Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones de Vercel
4. Espera propagación (puede tardar hasta 48 horas)

---

## 📊 Parte 6: Monitoreo

### 6.1 Analytics de Vercel

Vercel proporciona analytics gratuitos:

- Vercel Dashboard → Tu Proyecto → Analytics
- Puedes ver:
  - Número de visitas
  - Performance
  - Top pages
  - Devices & browsers

### 6.2 Logs en Tiempo Real

Para debug en producción:

1. Vercel Dashboard → Tu Proyecto → Functions
2. Verás logs en tiempo real
3. **Nota**: Frontend de Vite no tiene "functions", pero puedes ver build logs

---

## 🔐 Parte 7: Seguridad para Producción

### 7.1 Antes de ir a Mainnet

**NUNCA subas a GitHub**:
- ❌ Archivos `.env`
- ❌ Private keys
- ❌ Keypairs (`.json`)
- ❌ Seed phrases

### 7.2 Variables de Entorno en Vercel

Para mainnet:

1. Cambia `VITE_NETWORK` a `mainnet-beta`
2. Agrega RPC privado (no uses públicos en producción):
   ```
   VITE_RPC_URL=https://your-private-rpc.com
   ```
3. Considera usar:
   - Alchemy: https://www.alchemy.com/solana
   - QuickNode: https://www.quicknode.com/chains/sol
   - Helius: https://www.helius.dev/

### 7.3 CORS y Security Headers

Vercel ya maneja CORS automáticamente, pero puedes agregar headers en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 📝 Checklist de Deploy

Antes de considerarlo completo:

- [ ] Programa Solana deployed en devnet
- [ ] Program ID actualizado en código
- [ ] IDL copiado a `src/idl/`
- [ ] `.gitignore` configurado correctamente
- [ ] Código pusheado a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso (verde)
- [ ] URL de producción funciona
- [ ] Wallet conecta correctamente
- [ ] No hay errores en consola del navegador
- [ ] Funcionalidad básica probada (conectar wallet, ver órdenes)

---

## 🆘 Soporte

### Recursos Útiles

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js/

### Logs de Debug

**Ver logs de build en Vercel**:
```
Vercel Dashboard → Deployments → [Tu Deploy] → Build Logs
```

**Ver logs del browser**:
```
F12 → Console (Chrome/Firefox)
```

**Ver network requests**:
```
F12 → Network → Filter: WS, Fetch/XHR
```

---

## 🎯 Próximos Pasos

Una vez deployed en Vercel:

1. **Testing exhaustivo**: Prueba todas las funcionalidades
2. **Oracle Backend**: Considera deployar en:
   - Railway: https://railway.app/
   - Render: https://render.com/
   - Heroku: https://www.heroku.com/
3. **Monitoring**: Configura alertas para errores
4. **Performance**: Usa Lighthouse para optimizar
5. **SEO**: Agrega meta tags para mejor indexación

---

## 📞 Comandos Rápidos de Referencia

```bash
# Ver status de Git
git status

# Push cambios a GitHub (Vercel auto-deploya)
git add .
git commit -m "Mensaje del commit"
git push

# Ver logs de Vercel CLI (opcional)
npx vercel logs

# Build local para test
cd tipjar-frontend
npm run build
npm run preview
```

---

**Última actualización**: 26 de Octubre 2025
**Versión**: 1.0.0

¡Éxito con tu deployment! 🚀
