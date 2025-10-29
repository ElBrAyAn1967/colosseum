# 🎯 Configuración Vercel - Resumen Rápido

## ⚙️ Configuración en 3 Pasos

### 1️⃣ Import Settings

```
Framework Preset:    Vite
Root Directory:      tipjar-frontend    ⚠️ MUY IMPORTANTE
Build Command:       npm run build
Output Directory:    dist
```

### 2️⃣ Environment Variables (Obligatorias)

```env
VITE_PROGRAM_ID = 5xKNmT7yHqZ9xKpEJKVqCfRr3m4cFkj8ZhG5tPxLmN8K
VITE_NETWORK = devnet
VITE_RPC_URL = https://api.devnet.solana.com
```

### 3️⃣ Deploy

```
Click "Deploy" → Espera 2-3 min → ¡Listo! 🚀
```

---

## 📋 Checklist de Verificación

### Antes de Deploy:
- [ ] Código en GitHub
- [ ] Program ID obtenido (anchor deploy)

### Configuración Vercel:
- [ ] Root Directory = `tipjar-frontend`
- [ ] Framework = Vite
- [ ] 3 variables de entorno agregadas

### Después de Deploy:
- [ ] URL funciona
- [ ] Console sin errores (F12)
- [ ] Wallet conecta

---

## 🚨 Errores Comunes

| Error | Solución |
|-------|----------|
| Build failed | Verifica Root Directory = `tipjar-frontend` |
| Program ID not found | Agrega VITE_PROGRAM_ID en Settings → Env Variables |
| Wallet no conecta | Verifica que wallet esté en Devnet |
| 404 en rutas | Ya configurado en vercel.json |

---

## 🔗 URLs Importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Guía Completa**: Ver [CONFIGURACION_VERCEL.md](CONFIGURACION_VERCEL.md)
- **APIs Necesarias**: Ver [APIS_NECESARIAS.md](APIS_NECESARIAS.md)

---

## 📸 Captura de Configuración

Tu configuración debe verse así:

```
┌──────────────────────────────────────────────────┐
│ Configure Project                                │
├──────────────────────────────────────────────────┤
│                                                  │
│ Framework Preset:    Vite                        │
│ Root Directory:      tipjar-frontend    ← EDIT  │
│ Build Command:       npm run build               │
│ Output Directory:    dist                        │
│                                                  │
├──────────────────────────────────────────────────┤
│ Environment Variables                            │
├──────────────────────────────────────────────────┤
│ VITE_PROGRAM_ID                                  │
│ VITE_NETWORK                                     │
│ VITE_RPC_URL                                     │
│                                                  │
│                                 [Deploy] ────►   │
└──────────────────────────────────────────────────┘
```

---

**Ver guía detallada en**: [CONFIGURACION_VERCEL.md](CONFIGURACION_VERCEL.md)
