# 🎯 EMPIEZA AQUÍ - 3 Pasos Simples

## ✅ EL SERVIDOR YA FUNCIONA

Acabo de probarlo y funciona correctamente. Solo necesitas seguir estos 3 pasos:

---

## **PASO 1: Abre una Terminal NUEVA**

No uses la que tiene errores. Abre una terminal limpia.

```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
npm run dev
```

**Verás**:
```
VITE v7.1.12  ready in 320 ms
➜  Local:   http://localhost:5173/
```

✅ Déjala corriendo. NO la cierres.

---

## **PASO 2: Abre tu Navegador**

1. Abre **Chrome** o **Firefox**
2. Ve a: **http://localhost:5173**

**Deberías ver**:
- Página de "Solanita P2P"
- Botón "Connect Wallet"
- Fondo morado/púrpura

---

## **PASO 3: Conecta tu Wallet**

### Si NO tienes Phantom:
1. Instala: https://phantom.app/
2. Crea una wallet
3. Settings → Developer Settings → Testnet Mode ON
4. Selecciona "Devnet"

### Si YA tienes Phantom:
1. Abre Phantom
2. Settings → Developer Settings
3. Testnet Mode: **ON**
4. Network: **Devnet**
5. Ve a: http://localhost:5173
6. Click "Connect Wallet"
7. Selecciona Phantom
8. Aprueba

---

## ✅ SI FUNCIONA

Verás:
- Tu dirección de wallet arriba
- Menú: Marketplace, My Orders, Create Order, Profile
- Puedes navegar entre páginas

¡LISTO! Tu aplicación está funcionando.

---

## ❌ SI NO FUNCIONA

### **Pantalla en Blanco**:
1. Presiona `F12`
2. Ve a "Console"
3. Copia TODOS los errores rojos
4. Compártelos

### **No se ve nada**:
```bash
# Detén el servidor (Ctrl + C)
# Limpia:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Error "Cannot find module"**:
```bash
npm install
```

---

## 📋 CHECKLIST RÁPIDO

Antes de decir que no funciona:

- [ ] Terminal dice "ready in X ms" y muestra "Local: http://localhost:5173/"
- [ ] Navegador apunta a http://localhost:5173 (no https, no otro puerto)
- [ ] Phantom instalada
- [ ] Phantom en modo Devnet
- [ ] F12 abierto para ver errores

---

## 🆘 SI AÚN NO FUNCIONA

Ejecuta estos comandos y comparte el resultado:

```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
echo "=== Node Version ===" && node --version
echo "=== NPM Version ===" && npm --version
echo "=== Directory ===" && pwd
echo "=== Files ===" && ls -la | head -20
echo "=== .env ===" && cat .env
echo "=== Package.json ===" && cat package.json | head -20
```

---

## 🎉 ¡ESO ES TODO!

Solo 3 pasos:
1. `npm run dev` ✅
2. Abre http://localhost:5173 ✅
3. Conecta wallet ✅

**Guía completa**: Ver [GUIA_COMPLETA_LOCAL.md](GUIA_COMPLETA_LOCAL.md)
