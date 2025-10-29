# 🚀 GUÍA COMPLETA - Ver tu Aplicación Localmente (De 0 a 100)

## 📋 LO QUE NECESITAS SABER

Tu aplicación tiene 3 partes:
1. **Programa Solana** (ya deployed en devnet) ✅
2. **Frontend React** (lo que verás en el navegador) ⏳
3. **Oracle Backend** (opcional por ahora) ⏳

Vamos a hacer que el **FRONTEND** funcione localmente.

---

## 🛠️ PASO 1: INSTALAR TODO CORRECTAMENTE

### 1.1 Abrir Terminal

Abre una terminal nueva (no uses la que tiene errores).

### 1.2 Navegar al Frontend

```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
```

### 1.3 Verificar que los Archivos Existen

```bash
ls -la
```

**Deberías ver**:
- `package.json` ✅
- `vite.config.js` ✅
- `src/` (carpeta) ✅
- `index.html` ✅
- `.env` ✅

### 1.4 Ver qué dice tu .env

```bash
cat .env
```

**Debería mostrar**:
```
VITE_PROGRAM_ID=4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun
VITE_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
```

✅ Si se ve así, continúa.
❌ Si no existe o está mal, ejecuta:

```bash
cat > .env << 'EOF'
VITE_PROGRAM_ID=4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun
VITE_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
EOF
```

---

## 🚀 PASO 2: INICIAR EL SERVIDOR LOCAL

### 2.1 Ejecutar el Servidor

```bash
npm run dev
```

**Qué esperar**:
- Verás algo como:
  ```
  VITE v7.1.12  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
  ```

✅ Si ves esto: **¡FUNCIONA!** Continúa al PASO 3.

❌ Si ves errores:

### **Error Común 1**: `Cannot find module 'X'`

**Solución**:
```bash
# Detén el servidor (Ctrl + C)
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Error Común 2**: `Port 5173 is already in use`

**Solución**:
```bash
# Mata el proceso en ese puerto
kill $(lsof -t -i:5173)
# O usa otro puerto:
npm run dev -- --port 5174
```

### **Error Común 3**: `EACCES: permission denied`

**Solución**:
```bash
sudo chown -R $USER:$USER /home/Brayan-sol/solanita/tipjar-frontend
npm run dev
```

---

## 🌐 PASO 3: ABRIR EN EL NAVEGADOR

### 3.1 Abrir el Navegador

1. Abre **Google Chrome** o **Firefox**
2. Ve a: `http://localhost:5173`

### 3.2 Qué Deberías Ver

✅ **Si TODO está bien**:
- Página con el título "Solanita P2P"
- Botón "Connect Wallet"
- Sin errores en la pantalla
- Fondo con gradiente morado/púrpura

❌ **Si ves Pantalla en Blanco**:
- Presiona `F12` para abrir DevTools
- Ve a la pestaña **Console**
- Lee los errores (ver PASO 4)

---

## 🐛 PASO 4: VERIFICAR LA CONSOLA DEL NAVEGADOR

### 4.1 Abrir DevTools

- **Chrome/Firefox**: Presiona `F12`
- O click derecho → "Inspect" → pestaña "Console"

### 4.2 Qué Deberías Ver (SIN ERRORES)

✅ **Console correcta**:
```
🚀 Solanita P2P - Starting...
📡 Network: devnet
🔗 RPC Endpoint: https://api.devnet.solana.com
💰 Program ID: 4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun
```

### 4.3 Errores Comunes y Soluciones

#### **Error**: `Cannot find module '@solana/web3.js'`

**Solución**:
```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets
npm run dev
```

#### **Error**: `Buffer is not defined`

**Solución**: Ya lo arreglamos con el archivo `polyfills.js` ✅

#### **Error**: `Failed to fetch` o `CORS error`

**Solución**:
- Tu wallet no está instalada, O
- Tu wallet no está en Devnet
- Instala Phantom: https://phantom.app/

---

## 🦊 PASO 5: CONECTAR TU WALLET

### 5.1 Instalar Phantom (si no la tienes)

1. Ve a: https://phantom.app/
2. Click "Download"
3. Instala la extensión de Chrome
4. Crea una wallet nueva o importa una existente

### 5.2 Cambiar a Devnet

1. Abre Phantom
2. Click en el ícono de Settings (⚙️)
3. Developer Settings
4. **Testnet Mode**: ON
5. Selecciona **Devnet**

### 5.3 Obtener SOL Gratis en Devnet

```bash
# En la terminal:
solana airdrop 2
```

O usa el faucet:
- https://faucet.solana.com/

### 5.4 Conectar en la App

1. En http://localhost:5173
2. Click "Connect Wallet"
3. Selecciona "Phantom"
4. Aprueba la conexión

✅ **Deberías ver**:
- Tu dirección de wallet en la esquina superior derecha
- Menú con opciones: Marketplace, My Orders, Create Order, Profile

---

## ✅ PASO 6: PROBAR LA APLICACIÓN

### 6.1 Navegar entre Páginas

Click en cada opción del menú:
- **Marketplace**: Ver órdenes disponibles
- **My Orders**: Tus órdenes
- **Create Order**: Crear nueva orden
- **Profile**: Tu perfil

### 6.2 Ver tu Perfil

1. Click "Profile"
2. Si es tu primera vez:
   - Verás "Create Profile"
   - Click "Create Profile (With KYC)" o "Without KYC"
   - Aprueba la transacción en Phantom
3. Deberías ver tus stats: Total Trades, Success Rate, etc.

---

## 📊 RESUMEN DE QUÉ DEBE FUNCIONAR

| Componente | Estado | Cómo Verificar |
|------------|--------|----------------|
| **Servidor corriendo** | ✅ | Terminal muestra "Local: http://localhost:5173" |
| **Página carga** | ✅ | Navegador muestra la app |
| **Console sin errores** | ✅ | F12 → Console (sin rojos) |
| **Wallet conecta** | ✅ | Se ve tu dirección |
| **Navegación funciona** | ✅ | Puedes cambiar de página |

---

## 🔄 REINICIAR TODO (Si algo falla)

### Reinicio Completo:

```bash
# 1. Detener servidor (Ctrl + C)

# 2. Limpiar TODO
cd /home/Brayan-sol/solanita/tipjar-frontend
rm -rf node_modules package-lock.json dist

# 3. Reinstalar
npm install

# 4. Verificar .env
cat .env

# 5. Iniciar de nuevo
npm run dev
```

---

## 🆘 SI NADA FUNCIONA

### Opción 1: Verificar Versiones

```bash
node --version  # Debe ser v18 o superior
npm --version   # Debe ser v9 o superior
```

Si son menores:
```bash
# Instalar nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Opción 2: Ver Logs Detallados

```bash
npm run dev --verbose
```

### Opción 3: Build para Producción

```bash
npm run build
npm run preview
# Abre: http://localhost:4173
```

---

## 📞 CHECKLIST FINAL

Antes de decir "no funciona", verifica:

- [ ] Node.js v18+ instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Estás en el directorio correcto (`pwd` muestra tipjar-frontend)
- [ ] `.env` existe y tiene el Program ID correcto
- [ ] `npm install` completó sin errores
- [ ] Puerto 5173 no está ocupado
- [ ] Phantom wallet instalada
- [ ] Wallet en modo Devnet
- [ ] F12 abierto para ver errores
- [ ] Servidor corriendo sin detenerse

---

## 🎯 COMANDOS RÁPIDOS DE REFERENCIA

```bash
# Ver donde estás
pwd

# Ir al frontend
cd /home/Brayan-sol/solanita/tipjar-frontend

# Ver archivos
ls -la

# Ver .env
cat .env

# Instalar dependencias
npm install

# Iniciar servidor
npm run dev

# Detener servidor
# (Ctrl + C)

# Limpiar y reinstalar
rm -rf node_modules package-lock.json && npm install

# Ver que puerto usa
lsof -i :5173

# Build para producción
npm run build
```

---

## ✨ QUÉ ESPERAR CUANDO FUNCIONE

**En la Terminal**:
```
VITE v7.1.12  ready in 450 ms
➜  Local:   http://localhost:5173/
```

**En el Navegador** (http://localhost:5173):
- Página bonita con gradiente morado
- Logo "💱 Solanita P2P"
- Botón "Connect Wallet"
- Sin pantalla en blanco

**En la Console** (F12):
```
🚀 Solanita P2P - Starting...
📡 Network: devnet
🔗 RPC Endpoint: https://api.devnet.solana.com
💰 Program ID: 4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun
```

**Después de Conectar Wallet**:
- Tu dirección aparece arriba a la derecha
- Puedes navegar a: Marketplace, My Orders, Create Order, Profile

---

**¡Eso es todo! Si sigues estos pasos, DEBE funcionar.** 🚀

Si algo falla, anota EXACTAMENTE qué error ves y en qué paso estás.
