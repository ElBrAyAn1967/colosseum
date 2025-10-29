# 🎨 Frontend P2P Marketplace - Guía Completa

## 📋 Descripción

Frontend completo para el marketplace P2P de pagos transfronterizos USA-México construido con:
- ⚛️ React 19
- 🎨 Tailwind CSS
- 💼 Solana Wallet Adapter
- ⚡ Vite
- 🔗 Anchor Web3

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd /home/Brayan-sol/solanita/tipjar-frontend
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env`:

```env
VITE_SOLANA_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun
```

**IMPORTANTE:** Después de hacer `anchor deploy`, actualiza el `VITE_PROGRAM_ID` con el nuevo Program ID.

### 3. Copiar el IDL del Programa

Después de compilar el programa con `anchor build`, copia el IDL:

```bash
# Desde el directorio raíz del proyecto
cp ../tipjar/target/idl/tipjar.json ./src/idl/tipjar.json
```

O crea el directorio y archivo:

```bash
mkdir -p src/idl
# Luego copia manualmente el contenido de target/idl/tipjar.json
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## 📁 Estructura del Proyecto

```
tipjar-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Barra de navegación
│   │   ├── WelcomePage.jsx         # Página de bienvenida
│   │   ├── OrderBook.jsx           # Libro de órdenes
│   │   ├── CreateOrderForm.jsx     # Formulario crear orden
│   │   ├── MyOrders.jsx            # Gestión de órdenes del usuario
│   │   └── UserProfile.jsx         # Perfil de usuario
│   ├── hooks/
│   │   └── useP2PProgram.js        # Hook para interactuar con programa
│   ├── context/
│   │   └── WalletContextProvider.jsx # Proveedor de wallet
│   ├── idl/
│   │   └── tipjar.json             # IDL del programa (generado)
│   ├── App.jsx                     # Componente principal
│   ├── App.css                     # Estilos globales
│   └── main.jsx                    # Entry point
├── tailwind.config.js              # Configuración Tailwind
├── postcss.config.js               # Configuración PostCSS
├── vite.config.js                  # Configuración Vite
└── package.json
```

## 🎯 Componentes Principales

### 1. **WelcomePage** (`/`)
- Landing page con información del sistema
- Botón para conectar wallet
- Features y "How it works"
- Estadísticas de la plataforma

### 2. **OrderBook** (`/marketplace`)
- Lista de todas las órdenes activas
- Filtros: All / Open / My Orders
- Botón para aceptar órdenes
- Auto-refresh cada 30 segundos

### 3. **CreateOrderForm** (`/createOrder`)
- Formulario para crear órdenes de venta
- Selección de token (SOL/USDC/USDT)
- Input de cantidad y precio MXN
- Validación de límite 9,000 MXN
- Cálculo automático de exchange rate

### 4. **MyOrders** (`/myOrders`)
- Órdenes del usuario (como seller o buyer)
- Acciones contextuales según el estado:
  - **Seller**: Depositar en escrow, abrir disputa
  - **Buyer**: Confirmar pago, ver estado
- Modales para confirmar pago y disputas

### 5. **UserProfile** (`/profile`)
- Estadísticas de trading del usuario
- Estado de KYC
- Crear perfil si no existe
- Success rate y total de trades

### 6. **Navbar**
- Navegación entre secciones
- Botón de wallet (connect/disconnect)
- Responsive design

## 🔗 Integración con Web3

### Hook Principal: `useP2PProgram()`

```javascript
import { useP2PProgram } from './hooks/useP2PProgram';

function MyComponent() {
  const {
    // Estado
    connected,
    publicKey,
    program,

    // Métodos
    createUserProfile,
    createOrder,
    acceptOrder,
    depositToEscrowNative,
    confirmFiatPayment,
    openDispute,
    cancelOrderNative,

    // Fetch
    fetchAllOrders,
    fetchOrder,
    checkUserProfile,
  } = useP2PProgram();

  // Usar los métodos...
}
```

### Ejemplo: Crear Orden

```javascript
const handleCreateOrder = async () => {
  try {
    const orderId = `ORDER_${Date.now()}`;
    const amount = 0.5 * 1e9; // 0.5 SOL (9 decimales)
    const amountMxn = 2000 * 1e6; // 2,000 MXN (6 decimales)

    const result = await createOrder(
      orderId,
      amount,
      amountMxn,
      'SOL',
      'STP',
      'STP_REF_001'
    );

    console.log('Orden creada:', result.tx);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Ejemplo: Aceptar Orden

```javascript
const handleAcceptOrder = async (orderPda) => {
  try {
    const tx = await acceptOrder(orderPda);
    console.log('Orden aceptada:', tx);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## 🎨 Personalización de Estilos

### Tailwind CSS

Los estilos están configurados con Tailwind CSS. Para personalizar:

**tailwind.config.js:**
```javascript
theme: {
  extend: {
    colors: {
      // Agregar colores personalizados
      brand: {
        primary: '#7c3aed',
        secondary: '#4f46e5',
      }
    }
  }
}
```

### Estilos Globales

**App.css:**
- Estilos del wallet adapter
- Animaciones personalizadas
- Scrollbar customizado
- Estados de hover/focus

## 📱 Responsive Design

El frontend está completamente optimizado para:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

Puntos de quiebre principales:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## 🔧 Configuración Avanzada

### Cambiar Red de Solana

**main.jsx:**
```javascript
const endpoint = "https://api.devnet.solana.com"; // Devnet
// const endpoint = "https://api.mainnet-beta.solana.com"; // Mainnet
// const endpoint = "http://localhost:8899"; // Local
```

### Agregar Más Wallets

**main.jsx:**
```javascript
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter, // Agregar nuevos
} from '@solana/wallet-adapter-wallets';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
  new LedgerWalletAdapter(), // Agregar aquí
];
```

### Actualizar Program ID

Después de cada deploy del programa:

1. **Copiar nuevo Program ID del output de `anchor deploy`**
2. **Actualizar en `.env`:**
   ```env
   VITE_PROGRAM_ID=<nuevo_program_id>
   ```
3. **Actualizar en `useP2PProgram.js`:**
   ```javascript
   const PROGRAM_ID = new PublicKey('<nuevo_program_id>');
   ```
4. **Copiar nuevo IDL:**
   ```bash
   cp ../tipjar/target/idl/tipjar.json ./src/idl/tipjar.json
   ```
5. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

## 🐛 Troubleshooting

### Error: "IDL not found"

```bash
# Asegurarse de que el IDL existe
ls src/idl/tipjar.json

# Si no existe, compilar programa y copiar
cd ../tipjar
anchor build
cp target/idl/tipjar.json ../tipjar-frontend/src/idl/
```

### Error: "Program ID mismatch"

Actualizar el Program ID en `.env` y `useP2PProgram.js` después de cada deploy.

### Wallet no conecta

1. Instalar una wallet (Phantom recomendado): https://phantom.app/
2. Cambiar a Devnet en la wallet
3. Obtener SOL de prueba: https://faucet.solana.com/

### Estilos no se aplican

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install

# Limpiar cache
rm -rf .vite
npm run dev
```

### Error: "Failed to fetch account"

El programa no está desplegado o el RPC está caído:

```bash
# Verificar que el programa está desplegado
solana program show <program_id>

# Cambiar RPC si es necesario
# En .env: VITE_RPC_URL=https://api.devnet.solana.com
```

## 📦 Build para Producción

```bash
# Build
npm run build

# Preview
npm run preview

# Output en: dist/
```

### Deploy a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Deploy a Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🔐 Seguridad

### Variables de Entorno

❌ **NUNCA** expongas:
- Private keys
- API secrets
- Credenciales sensibles

✅ Solo exponer:
- Public keys
- RPC URLs públicos
- Program IDs

### Validación de Inputs

Todos los formularios incluyen validaciones:
- Límites de transacción (9,000 MXN)
- Montos positivos
- Campos requeridos
- Formato de referencias

### Confirmaciones

El usuario debe confirmar:
- Transacciones de blockchain
- Apertura de disputas
- Cancelación de órdenes

## 📚 Recursos

- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Vite](https://vitejs.dev/)

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Crear nuevo componente en `src/components/`
2. Agregar ruta en `App.jsx`
3. Agregar link en `Navbar.jsx`
4. Actualizar documentación

## 📝 Checklist Pre-Launch

- [ ] Actualizar Program ID en `.env`
- [ ] Copiar IDL actualizado
- [ ] Probar en Devnet completamente
- [ ] Revisar límites y validaciones
- [ ] Testear en mobile
- [ ] Verificar wallet connections
- [ ] Deploy a staging
- [ ] Auditoría de seguridad
- [ ] Deploy a producción

---

**¡Frontend listo para usar! 🎉**

Para cualquier duda, consulta la [documentación completa](../COMPLETE_DOCUMENTATION.md).
