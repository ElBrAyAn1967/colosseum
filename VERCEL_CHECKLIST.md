# ✅ Checklist Final para Deploy en Vercel

## 📋 Archivos Configurados

### ✅ Configuración de Vercel
- [x] **vercel.json** creado en `tipjar-frontend/`
  - Framework: Vite
  - Output directory: dist
  - Rewrites configurados para SPA
  - Headers de cache optimizados

### ✅ Configuración de Build
- [x] **vite.config.js** actualizado
  - Build optimizado con code splitting
  - Chunks separados para Solana, Anchor, Wallet Adapter
  - Aliases configurados para polyfills
  - Source maps deshabilitados para producción

### ✅ Package.json
- [x] Script `vercel-build` agregado
- [x] Todas las dependencias correctas
- [x] Type: module configurado

### ✅ Seguridad
- [x] **.gitignore** actualizado en raíz del proyecto
  - .env files excluidos
  - Keypairs excluidos
  - node_modules excluido
  - Build outputs excluidos

- [x] **.gitignore** actualizado en `tipjar-frontend/`
  - Variables de entorno protegidas
  - Build outputs excluidos
  - .vercel folder excluido

### ✅ Environment Variables
- [x] **.env.example** creado en `tipjar-frontend/`
  - Template para VITE_PROGRAM_ID
  - Template para VITE_NETWORK
  - Template para VITE_RPC_URL (opcional)

### ✅ IDL
- [x] IDL copiado a `tipjar-frontend/src/idl/tipjar.json`
- [x] Directorio `src/idl/` creado

### ✅ Documentación
- [x] **DEPLOY_VERCEL.md** - Guía paso a paso completa
- [x] **ENV_VARIABLES_GUIDE.md** - Guía de variables de entorno
- [x] **README.md** - Documentación principal del proyecto
- [x] **VERCEL_CHECKLIST.md** - Este archivo

---

## 🚀 Pasos para Deploy (Resumen)

### 1️⃣ Pre-Deploy
```bash
# En la raíz del proyecto
cd /home/Brayan-sol/solanita

# Verificar que anchor build fue exitoso
cd tipjar && anchor build

# Anotar el Program ID si ya hiciste deploy
# anchor deploy
```

### 2️⃣ Actualizar Program ID
Actualiza tu Program ID en:
- [ ] `tipjar-frontend/src/hooks/useP2PProgram.js` (línea ~10)
- [ ] Tendrás que configurarlo en Vercel como variable de entorno

### 3️⃣ Git Setup
```bash
cd /home/Brayan-sol/solanita

# Inicializar git (si no está hecho)
git init

# Verificar .gitignore
cat .gitignore

# Add y commit
git add .
git commit -m "Initial commit: Solanita P2P ready for Vercel"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/solanita-p2p.git
git branch -M main
git push -u origin main
```

### 4️⃣ Vercel Deploy
1. Ve a https://vercel.com/
2. Login con GitHub
3. "Add New..." → "Project"
4. Import tu repositorio `solanita-p2p`
5. **IMPORTANTE**: Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `tipjar-frontend` ⚠️ CRÍTICO
   - **Build Command**: `npm run build` (auto-detectado)
   - **Output Directory**: `dist` (auto-detectado)

### 5️⃣ Environment Variables en Vercel
Agrega estas variables ANTES de hacer deploy:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `VITE_PROGRAM_ID` | Tu Program ID | `5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K` |
| `VITE_NETWORK` | `devnet` o `mainnet-beta` | `devnet` |

### 6️⃣ Deploy
- Click en "Deploy"
- Espera 2-3 minutos
- ¡Listo! 🎉

---

## 🔍 Verificaciones Post-Deploy

### Checklist de Testing
- [ ] La página carga sin errores
- [ ] No hay errores en la consola del browser (F12)
- [ ] Botón "Connect Wallet" funciona
- [ ] Puedes conectar Phantom/Solflare
- [ ] La wallet conecta en la red correcta (Devnet)
- [ ] Puedes ver el Marketplace
- [ ] No hay errores de "Program ID not found"
- [ ] No hay errores de "IDL not found"

### Si hay errores:

#### ❌ "Program ID not found"
```
Solución:
1. Vercel Dashboard → Settings → Environment Variables
2. Verificar que VITE_PROGRAM_ID esté correcto
3. Redeploy
```

#### ❌ "Cannot read properties of undefined (reading 'idl')"
```
Solución:
1. Verificar que tipjar.json esté en src/idl/
2. git add src/idl/tipjar.json
3. git commit -m "Add IDL"
4. git push
```

#### ❌ "Network mismatch"
```
Solución:
1. Cambiar wallet a Devnet
2. O actualizar VITE_NETWORK en Vercel
```

---

## 📁 Estructura de Archivos Críticos

```
solanita/
├── .gitignore ✅ CREADO
├── README.md ✅ CREADO
├── DEPLOY_VERCEL.md ✅ CREADO
├── ENV_VARIABLES_GUIDE.md ✅ CREADO
├── VERCEL_CHECKLIST.md ✅ CREADO (este archivo)
├── REQUISITOS_PROYECTO.md ✅ YA EXISTÍA
├── COMPLETE_DOCUMENTATION.md ✅ YA EXISTÍA
│
├── tipjar/
│   ├── programs/tipjar/
│   │   ├── src/lib.rs ✅ COMPILADO
│   │   └── Cargo.toml ✅ ACTUALIZADO
│   ├── target/idl/
│   │   └── tipjar.json ✅ GENERADO
│   └── oracle-backend/
│       └── .env.example ✅ YA EXISTÍA
│
└── tipjar-frontend/
    ├── .gitignore ✅ ACTUALIZADO
    ├── .env.example ✅ CREADO
    ├── vercel.json ✅ CREADO
    ├── vite.config.js ✅ ACTUALIZADO
    ├── package.json ✅ ACTUALIZADO
    ├── src/
    │   ├── idl/
    │   │   └── tipjar.json ✅ COPIADO
    │   ├── hooks/
    │   │   └── useP2PProgram.js ✅ (actualizar Program ID)
    │   ├── components/ ✅ 7 componentes
    │   └── App.jsx ✅
    └── ...
```

---

## ⚠️ Archivos que NO deben estar en GitHub

### VERIFICAR antes de push:
```bash
# Ejecuta esto para verificar que .env NO está en git:
git ls-files | grep .env

# No debe mostrar nada. Si muestra algo, ejecuta:
git rm --cached tipjar-frontend/.env
git commit -m "Remove .env from git"
```

### Archivos críticos a NO commitear:
- ❌ `.env`
- ❌ `.env.local`
- ❌ `*-keypair.json`
- ❌ Cualquier archivo con private keys

---

## 🎯 Variables de Entorno - Referencia Rápida

### Frontend (.env)
```env
VITE_PROGRAM_ID=TU_PROGRAM_ID_AQUI
VITE_NETWORK=devnet
```

### Vercel Dashboard
```
VITE_PROGRAM_ID → Tu Program ID de Solana
VITE_NETWORK → devnet (o mainnet-beta para producción)
```

---

## 🔄 Workflow de Actualizaciones

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios
# 2. Test local
npm run dev

# 3. Build local (opcional)
npm run build

# 4. Commit y push
git add .
git commit -m "Descripción de cambios"
git push

# 5. Vercel auto-deploya 🚀
```

---

## 📊 Resumen de Configuración

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Programa Solana | ✅ Compilado | Sin errores de build |
| IDL Generado | ✅ Completo | Copiado a frontend |
| Frontend Build Config | ✅ Optimizado | vite.config.js actualizado |
| Vercel Config | ✅ Listo | vercel.json creado |
| .gitignore | ✅ Configurado | Protege archivos sensibles |
| .env.example | ✅ Creado | Template para usuarios |
| Documentación | ✅ Completa | 5 archivos de docs |
| Package.json | ✅ Actualizado | Script vercel-build agregado |
| Code Splitting | ✅ Configurado | Chunks optimizados |
| Cache Headers | ✅ Configurado | Assets con cache 1 año |

---

## 🎉 Estado Final

### ✅ TODO LISTO PARA VERCEL

Tu proyecto está **100% configurado** para ser deployado en Vercel. Solo necesitas:

1. ✅ Hacer deploy del programa Solana (si no lo has hecho)
2. ✅ Actualizar Program ID en el código
3. ✅ Push a GitHub
4. ✅ Import en Vercel
5. ✅ Configurar variables de entorno
6. ✅ Deploy

---

## 📞 Recursos de Ayuda

- **Guía de Deploy**: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
- **Variables de Entorno**: [ENV_VARIABLES_GUIDE.md](ENV_VARIABLES_GUIDE.md)
- **Documentación General**: [README.md](README.md)
- **Vercel Docs**: https://vercel.com/docs

---

## 🐛 Debugging

### Ver logs en Vercel:
```
Dashboard → Deployments → [Tu Deploy] → Build Logs
```

### Ver logs del browser:
```
F12 → Console
F12 → Network (para ver requests RPC)
```

### Redeploy después de cambios:
```
Dashboard → Settings → Deployments → Redeploy
```

---

**Última actualización**: 26 de Octubre 2025
**Versión**: 1.0.0

✨ **¡Tu proyecto está listo para brillar en Vercel!** ✨
