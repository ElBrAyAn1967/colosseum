# KYC NFT System

Sistema de emisión y gestión de NFTs para verificación KYC en el sistema de pagos P2P.

## Características

- ✅ Emisión de NFTs de verificación KYC
- ✅ 4 niveles de verificación (Basic, Standard, Enhanced, Premium)
- ✅ Revocación de NFTs
- ✅ Renovación y actualización de KYC
- ✅ Verificación de estado on-chain
- ✅ Metadata compatible con Metaplex
- ✅ Collection NFT para agrupación
- ✅ Registro inmutable de historial

## Niveles de Verificación

### Basic
- ✅ Email verificado
- ✅ Número telefónico
- Límite: 1,000 MXN/transacción

### Standard
- ✅ Basic +
- ✅ ID oficial (INE/Pasaporte)
- ✅ Selfie
- Límite: 5,000 MXN/transacción

### Enhanced
- ✅ Standard +
- ✅ Comprobante de domicilio
- ✅ Video verificación
- Límite: 9,000 MXN/transacción

### Premium
- ✅ Enhanced +
- ✅ Verificación biométrica
- ✅ Background check
- Límite: Sin límite especial

## Estructura del NFT

```rust
pub struct KycRecord {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub user_name: String,
    pub user_id: String,
    pub verification_level: VerificationLevel,
    pub issued_at: i64,
    pub expires_at: Option<i64>,
    pub is_valid: bool,
    pub metadata_uri: String,
}
```

## Metadata JSON

```json
{
  "name": "KYC Verification - Standard",
  "symbol": "KYC",
  "description": "Certificado de verificación KYC nivel Standard",
  "image": "https://tu-cdn.com/kyc-standard.png",
  "attributes": [
    {
      "trait_type": "Verification Level",
      "value": "Standard"
    },
    {
      "trait_type": "Issued Date",
      "value": "2024-01-15"
    },
    {
      "trait_type": "Issuer",
      "value": "Solanita KYC Authority"
    },
    {
      "trait_type": "Status",
      "value": "Valid"
    }
  ],
  "properties": {
    "category": "certificate",
    "files": [
      {
        "uri": "https://tu-cdn.com/kyc-standard.png",
        "type": "image/png"
      }
    ]
  }
}
```

## Flujo de Verificación KYC

### 1. Usuario solicita verificación

```typescript
// Frontend
const requestKyc = async (level: 'basic' | 'standard' | 'enhanced' | 'premium') => {
  // Usuario sube documentos
  const documents = await uploadDocuments();

  // Backend procesa y verifica
  const result = await kycService.verify(userPublicKey, documents, level);

  return result;
};
```

### 2. Backend verifica documentos

```typescript
// Backend KYC Service
async verifyDocuments(userId, documents, level) {
  // Verificación automática con IA/OCR
  const ocrResult = await ocr.process(documents.id);

  // Verificación biométrica
  const faceMatch = await biometrics.compare(documents.selfie, ocrResult.photo);

  // Verificación en listas negras
  const screening = await compliance.check(ocrResult.name, ocrResult.id);

  if (allChecksPass) {
    return { approved: true };
  }
}
```

### 3. Emisión de NFT

```typescript
// Backend emite NFT on-chain
await program.methods
  .issueKycNft(
    userName,
    userId,
    { standard: {} },
    metadataUri
  )
  .accounts({
    kycAuthority,
    kycRecord,
    user: userPublicKey,
    mint: nftMint,
    // ...
  })
  .rpc();
```

### 4. Usuario usa NFT en el sistema P2P

```typescript
// Al crear perfil, referencia el NFT
await p2pProgram.methods
  .createUserProfile(
    true, // kyc_verified
    nftMint // kyc_nft_mint
  )
  .accounts({
    userProfile,
    user: wallet.publicKey,
  })
  .rpc();
```

## Integración con el sistema P2P

### Verificar KYC antes de operar

```rust
// En el programa P2P
pub fn create_order(ctx: Context<CreateOrder>, ...) -> Result<()> {
    let profile = &ctx.accounts.seller_profile;

    // Verificar que tiene KYC
    require!(profile.kyc_verified, ErrorCode::KYCRequired);

    // Opcional: Verificar nivel de KYC según monto
    if let Some(kyc_mint) = profile.kyc_nft_mint {
        let kyc_record = get_kyc_record(kyc_mint)?;
        require_min_level(kyc_record.verification_level, amount_mxn)?;
    }

    // Continuar con la orden...
}
```

## API del Backend KYC

### POST /kyc/verify
Iniciar proceso de verificación

```bash
curl -X POST https://api.tu-dominio.com/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userPublicKey": "...",
    "level": "standard",
    "documents": {
      "idFront": "base64...",
      "idBack": "base64...",
      "selfie": "base64...",
      "proofOfAddress": "base64..."
    }
  }'
```

### GET /kyc/status/:publicKey
Consultar estado de verificación

```bash
curl https://api.tu-dominio.com/kyc/status/7xK8...9pQ
```

Response:
```json
{
  "status": "verified",
  "level": "standard",
  "nftMint": "8sD2...3pL",
  "issuedAt": "2024-01-15T10:30:00Z",
  "expiresAt": null
}
```

### POST /kyc/revoke
Revocar certificación (solo admin)

```bash
curl -X POST https://api.tu-dominio.com/kyc/revoke \
  -H "Authorization: Bearer admin_token" \
  -d '{
    "userPublicKey": "...",
    "reason": "Documentos fraudulentos detectados"
  }'
```

## Servicios Recomendados para KYC

### Verificación de Identidad
- **Onfido**: OCR + biometría + compliance
- **Jumio**: Verificación de documentos global
- **Trulioo**: Verificación de identidad internacional
- **Veriff**: Video KYC + liveness detection

### México específico
- **Truora**: Verificación de identidad en LATAM
- **Rappi Verificación**: Servicio local de KYC
- **RENAPO**: Consulta INE/CURP oficial

### Servicios de IA/OCR
- **Google Cloud Vision**: OCR de documentos
- **AWS Textract**: Extracción de texto
- **Azure Form Recognizer**: Análisis de formularios

## Costos Estimados

### Verificación por usuario
- **Basic**: $0.10 USD (solo email/SMS)
- **Standard**: $1-2 USD (OCR + biometría)
- **Enhanced**: $3-5 USD (+ verificación manual)
- **Premium**: $10-15 USD (full background check)

### Infraestructura
- Storage para documentos: AWS S3 / IPFS
- CDN para metadata: Cloudflare / Arweave
- Base de datos: PostgreSQL / MongoDB

## Cumplimiento Legal

### México
- ✅ Ley FinTech (LFITRAF)
- ✅ Ley Anti-Lavado de Dinero
- ✅ CNBV (Comisión Nacional Bancaria y de Valores)

### Datos requeridos
- Nombre completo
- Fecha de nacimiento
- Nacionalidad
- RFC / CURP
- Domicilio
- Actividad económica
- Origen de fondos (para montos altos)

### Retención de datos
- Mínimo 5 años después de la última operación
- Documentos encriptados
- Acceso auditado

## Seguridad

### Almacenamiento de documentos
- Encriptación AES-256 en reposo
- Encriptación TLS en tránsito
- Hash de documentos en blockchain
- Acceso limitado por roles

### Prevención de fraude
- Detección de liveness (video en vivo)
- Análisis de metadatos de imágenes
- Verificación de lista negra (OFAC, PEPs)
- Machine learning para detectar patrones

## Desarrollo

Para probar el sistema KYC:

```bash
# Compilar programa
anchor build

# Deploy
anchor deploy

# Inicializar
anchor run initialize-kyc

# Emitir NFT de prueba
anchor run issue-test-nft
```

## Próximos pasos

1. ✅ **Crear backend de verificación KYC**
2. ✅ **Integrar con servicio de OCR/biometría**
3. ✅ **Configurar storage para documentos**
4. ✅ **Subir metadata a IPFS/Arweave**
5. ✅ **Crear diseños de NFTs para cada nivel**
6. ✅ **Implementar renovación automática**
7. ✅ **Dashboard de administración**

## Recursos

- [Metaplex Metadata Standard](https://docs.metaplex.com/programs/token-metadata/)
- [NFT Metadata Standard](https://docs.metaplex.com/programs/token-metadata/token-standard)
- [Onfido API Docs](https://documentation.onfido.com/)
- [Ley FinTech México](https://www.cnbv.gob.mx/Paginas/ley-fintech.aspx)

## Licencia

MIT
