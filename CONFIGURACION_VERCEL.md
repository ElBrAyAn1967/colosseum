# ⚙️ Configuración de Vercel - Paso a Paso

Esta guía te muestra **EXACTAMENTE** qué configurar en Vercel para que tu aplicación funcione correctamente.

---

## 📋 Prerequisitos

Antes de empezar:
- ✅ Código subido a GitHub
- ✅ Programa Solana deployed (tienes el Program ID)
- ✅ Cuenta en Vercel (puedes usar GitHub login)

---

## 🚀 PASO 1: Importar Proyecto en Vercel

### 1.1 Login en Vercel

1. Ve a: https://vercel.com/
2. Click en **"Continue with GitHub"**
3. Autoriza a Vercel para acceder a tus repositorios

### 1.2 Importar Repositorio

1. En el Dashboard de Vercel, click en **"Add New..."**
2. Selecciona **"Project"**
3. Busca tu repositorio: `colosseum`
4. Click en **"Import"**

---

## ⚙️ PASO 2: Configuración del Proyecto (CRÍTICO)

### 2.1 Framework Preset

```
Framework Preset: Vite
```

✅ Vercel detectará esto automáticamente si ve el `vite.config.js`

### 2.2 Root Directory (MUY IMPORTANTE) ⚠️

**ESTO ES CRÍTICO:**

1. Click en **"Edit"** junto a "Root Directory"
2. Selecciona o escribe: **`tipjar-frontend`**
3. Click en **"Continue"**

❌ **Si no configuras esto, el build FALLARÁ**

```
Root Directory: tipjar-frontend
```

### 2.3 Build & Output Settings

Estos valores deberían auto-detectarse, pero verifica:

```
Build Command:     npm run build
Output Directory:  dist
Install Command:   npm install
```

✅ Déjalos como están si aparecen así.

### 2.4 Node.js Version (Opcional pero Recomendado)

Si quieres especificar la versión de Node.js:

1. En **"Environment Variables"** (lo veremos abajo)
2. Agrega:
   ```
   NODE_VERSION = 18
   ```

---

## 🔐 PASO 3: Environment Variables (Variables de Entorno)

**ESTO ES CRÍTICO PARA QUE FUNCIONE**

### 3.1 Variables Obligatorias

En la sección **"Environment Variables"**, agrega estas variables:

#### Variable 1: VITE_PROGRAM_ID

```
Name:  VITE_PROGRAM_ID
Value: [TU_PROGRAM_ID_AQUI]
```

**Cómo obtener el Program ID:**
```bash
cd /home/Brayan-sol/solanita/tipjar
anchor deploy
# El output mostrará: Program Id: xxxxx
```

**Ejemplo**:
```
Name:  VITE_PROGRAM_ID
Value: 5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K
```

#### Variable 2: VITE_NETWORK

```
Name:  VITE_NETWORK
Value: devnet
```

Para producción/mainnet:
```
Name:  VITE_NETWORK
Value: mainnet-beta
```

#### Variable 3: VITE_RPC_URL (Opcional pero Recomendado)

Para mejor performance:

```
Name:  VITE_RPC_URL
Value: https://api.devnet.solana.com
```

O si tienes RPC privado (Helius/Alchemy):
```
Name:  VITE_RPC_URL
Value: https://mainnet.helius-rpc.com/?api-key=TU_API_KEY
```

### 3.2 Configurar Environment Variables en Vercel

Para cada variable:

1. En **"Key"**: Escribe el nombre (ej: `VITE_PROGRAM_ID`)
2. En **"Value"**: Pega el valor
3. En **"Environment"**: Selecciona:
   - ✅ **Production** (siempre)
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (recomendado)
4. Click en **"Add"**

Repite para todas las variables.

### 3.3 Captura de Pantalla de Referencia

Tu configuración debería verse así:

```
┌─────────────────────┬────────────────────────────────────┬─────────────────────┐
│ Key                 │ Value                               │ Environments        │
├─────────────────────┼────────────────────────────────────┼─────────────────────┤
│ VITE_PROGRAM_ID     │ 5xKNmT7yHqZ9xKpE...                │ Production, Preview │
│ VITE_NETWORK        │ devnet                              │ Production, Preview │
│ VITE_RPC_URL        │ https://api.devnet.solana.com      │ Production, Preview │
└─────────────────────┴────────────────────────────────────┴─────────────────────┘
```

---

## 🚀 PASO 4: Deploy

1. Verifica toda la configuración:
   - ✅ Root Directory: `tipjar-frontend`
   - ✅ Framework: Vite
   - ✅ Variables de entorno agregadas

2. Click en **"Deploy"**

3. Espera 2-3 minutos

4. Vercel te mostrará:
   - ✅ Building... (compila el código)
   - ✅ Deploying... (sube a los servidores)
   - ✅ Ready! (listo)

---

## ✅ PASO 5: Verificación Post-Deploy

### 5.1 Acceder a tu Aplicación

1. Vercel te dará una URL como: `https://colosseum-abc123.vercel.app`
2. Click en **"Visit"** o abre esa URL

### 5.2 Verificar que Funciona

**Checklist de Verificación**:

1. **Página carga correctamente** ✅
   - Deberías ver el Welcome Page de Solanita P2P
   - Sin errores visibles

2. **Abrir Developer Console** (F12)
   - Busca los logs:
     ```
     🚀 Solanita P2P - Starting...
     📡 Network: devnet
     🔗 RPC Endpoint: https://api.devnet.solana.com
     💰 Program ID: 5xKN...
     ```
   - ✅ NO debe haber errores rojos

3. **Conectar Wallet**
   - Click en **"Connect Wallet"**
   - Selecciona Phantom o Solflare
   - **IMPORTANTE**: Asegúrate que la wallet esté en **Devnet**
   - ✅ La wallet debe conectar sin errores

4. **Verificar Funcionalidad**
   - Después de conectar deberías ver:
     - Tu dirección de wallet en el navbar
     - Opciones del menú (Marketplace, My Orders, etc.)
   - ✅ Puedes navegar entre páginas sin errores

---

## 🔧 PASO 6: Configuración Avanzada (Opcional)

### 6.1 Dominio Personalizado

Si tienes un dominio:

1. Ve a: **Settings** → **Domains**
2. Click en **"Add"**
3. Escribe tu dominio (ej: `solanita.com`)
4. Sigue las instrucciones para configurar DNS
5. Espera propagación (hasta 48 horas)

### 6.2 Configurar Redirects

Si quieres redirects personalizados, edita `vercel.json` en tu proyecto:

```json
{
  "redirects": [
    {
      "source": "/marketplace",
      "destination": "/",
      "permanent": false
    }
  ]
}
```

### 6.3 Agregar Variables Secretas

Para variables sensibles (API keys):

1. **Settings** → **Environment Variables**
2. Agrega variables como:
   ```
   VITE_MIXPANEL_TOKEN = tu_token_secreto
   ```
3. **NO uses** variables que no empiecen con `VITE_` (no estarán disponibles en el frontend)

### 6.4 Configurar Preview Deployments

Por defecto, cada push a una branch genera un preview deployment.

Para deshabilitarlo:
1. **Settings** → **Git**
2. Desmarca "Preview Deployments"

---

## 🔄 PASO 7: Actualizar la Aplicación

### 7.1 Después de Hacer Cambios

Vercel auto-deploya cada vez que haces push a GitHub:

```bash
cd /home/Brayan-sol/solanita

# Hacer cambios en tu código
# ...

# Commit y push
git add .
git commit -m "feat: Nueva funcionalidad"
git push

# Vercel auto-deploya en ~2 minutos
```

### 7.2 Monitorear Deployments

1. Ve a: **Deployments** en Vercel
2. Verás todos los deployments con status:
   - 🟢 **Ready** - Deploy exitoso
   - 🟡 **Building** - En progreso
   - 🔴 **Error** - Falló

### 7.3 Rollback a Versión Anterior

Si algo sale mal:

1. **Deployments** → Selecciona deployment anterior
2. Click en **"..."** (tres puntos)
3. Click en **"Promote to Production"**

---

## 🐛 PASO 8: Debugging - Problemas Comunes

### ❌ Error: "Build Failed"

**Problema**: El build falla en Vercel

**Solución**:
```
1. Ve a Deployments → Failed deployment → Build Logs
2. Lee el error
3. Errores comunes:
   - Root Directory incorrecto → Debe ser "tipjar-frontend"
   - npm install falla → Verifica package.json
   - Errores de TypeScript → Revisa tu código
```

### ❌ Error: "404 Not Found" en rutas

**Problema**: Al navegar a `/marketplace` da 404

**Solución**: Ya está configurado en `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Si persiste, verifica que `vercel.json` esté en `tipjar-frontend/`

### ❌ Error: "Program ID not found"

**Problema**: La app no encuentra el programa

**Solución**:
```
1. Settings → Environment Variables
2. Verifica que VITE_PROGRAM_ID esté correcto
3. Redeploy: Deployments → Latest → Redeploy
```

### ❌ Error: "Failed to fetch" en RPC

**Problema**: No puede conectar a Solana

**Solución**:
```
1. Verifica que VITE_NETWORK esté correcto (devnet o mainnet-beta)
2. Verifica que tu wallet esté en la misma red
3. Prueba cambiar VITE_RPC_URL a otro endpoint
```

### ❌ Error: "Wallet connection failed"

**Problema**: No puede conectar la wallet

**Solución**:
```
1. Asegúrate que la wallet (Phantom/Solflare) esté instalada
2. Verifica que la wallet esté en Devnet
3. Recarga la página
4. Check consola del browser (F12) para más detalles
```

---

## 📊 PASO 9: Monitoreo y Analytics

### 9.1 Vercel Analytics (Gratis)

1. Ve a: **Analytics**
2. Verás:
   - Número de visitantes
   - Page views
   - Top pages
   - Devices

### 9.2 Real-Time Logs

1. Ve a: **Functions** → **Logs**
2. Aquí verás logs en tiempo real (si usas serverless functions)

### 9.3 Integrar con Sentry (Opcional)

Para error tracking:

```bash
# En tu proyecto local
npm install @sentry/react

# Agrega a Vercel:
VITE_SENTRY_DSN = https://...@sentry.io/...
```

---

## 🎯 Checklist Final de Configuración

### Pre-Deploy
- [ ] Código en GitHub
- [ ] Programa Solana deployed
- [ ] Program ID obtenido

### Configuración Vercel
- [ ] Proyecto importado desde GitHub
- [ ] Framework: Vite ✅
- [ ] Root Directory: `tipjar-frontend` ✅
- [ ] VITE_PROGRAM_ID configurado ✅
- [ ] VITE_NETWORK configurado ✅
- [ ] VITE_RPC_URL configurado (opcional) ✅

### Post-Deploy
- [ ] Deploy exitoso (verde) ✅
- [ ] URL funciona ✅
- [ ] Página carga sin errores ✅
- [ ] Console logs correctos (F12) ✅
- [ ] Wallet conecta correctamente ✅
- [ ] Navegación funciona ✅
- [ ] No hay errores en console ✅

---

## 📝 Resumen de Configuración

### Configuración Mínima Funcional:

```
┌─────────────────────┬────────────────────────────────────┐
│ Setting             │ Value                               │
├─────────────────────┼────────────────────────────────────┤
│ Framework           │ Vite                                │
│ Root Directory      │ tipjar-frontend                     │
│ Build Command       │ npm run build                       │
│ Output Directory    │ dist                                │
│                     │                                     │
│ VITE_PROGRAM_ID     │ [Tu Program ID]                     │
│ VITE_NETWORK        │ devnet                              │
│ VITE_RPC_URL        │ https://api.devnet.solana.com      │
└─────────────────────┴────────────────────────────────────┘
```

---

## 🚀 Ejemplo de Flujo Completo

```bash
# 1. Deploy programa Solana
cd /home/Brayan-sol/solanita/tipjar
anchor deploy
# Output: Program Id: 5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K

# 2. Push a GitHub
cd /home/Brayan-sol/solanita
git push

# 3. En Vercel:
# - Import project
# - Root Directory: tipjar-frontend
# - Add env vars:
#   VITE_PROGRAM_ID=5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K
#   VITE_NETWORK=devnet
# - Deploy

# 4. Verificar en: https://colosseum-xyz.vercel.app
```

---

## 📞 Recursos Útiles

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Troubleshooting**: https://vercel.com/docs/troubleshooting

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, tu aplicación debería estar funcionando en:

```
https://colosseum-[tu-hash].vercel.app
```

**Funcionalidades que deberían funcionar**:
- ✅ Conectar wallet (Phantom, Solflare, etc.)
- ✅ Ver marketplace de órdenes
- ✅ Crear nuevas órdenes
- ✅ Ver perfil de usuario
- ✅ Navegar entre páginas

**Funcionalidades que necesitan backend adicional**:
- ⚠️ Verificación de pagos STP (necesita oracle backend)
- ⚠️ KYC completo (necesita proveedor KYC)
- ⚠️ Notificaciones (necesita Twilio/SendGrid)

Ver [APIS_NECESARIAS.md](APIS_NECESARIAS.md) para configurar servicios adicionales.

---

**Última actualización**: 29 de Octubre 2025

¡Éxito con tu deployment en Vercel! 🚀
