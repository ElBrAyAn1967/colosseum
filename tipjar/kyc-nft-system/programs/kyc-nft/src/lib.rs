use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        sign_metadata, set_and_verify_sized_collection_item,
        CreateMasterEditionV3, CreateMetadataAccountsV3,
        Metadata as MetadataProgram, SignMetadata,
        SetAndVerifySizedCollectionItem,
        mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("KYC1111111111111111111111111111111111111111");

#[program]
pub mod kyc_nft {
    use super::*;

    /// Inicializar el sistema de KYC NFT
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let kyc_authority = &mut ctx.accounts.kyc_authority;

        kyc_authority.authority = ctx.accounts.authority.key();
        kyc_authority.total_issued = 0;
        kyc_authority.total_revoked = 0;
        kyc_authority.collection_mint = ctx.accounts.collection_mint.key();
        kyc_authority.is_active = true;

        msg!("KYC NFT System inicializado");
        msg!("Authority: {}", kyc_authority.authority);
        msg!("Collection Mint: {}", kyc_authority.collection_mint);

        Ok(())
    }

    /// Emitir NFT de KYC a un usuario verificado
    pub fn issue_kyc_nft(
        ctx: Context<IssueKycNft>,
        user_name: String,
        user_id: String,
        verification_level: VerificationLevel,
        metadata_uri: String,
    ) -> Result<()> {
        require!(ctx.accounts.kyc_authority.is_active, ErrorCode::SystemNotActive);

        let kyc_record = &mut ctx.accounts.kyc_record;
        let kyc_authority = &mut ctx.accounts.kyc_authority;

        // Mintear 1 NFT
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        mint_to(cpi_context, 1)?;

        // Crear metadata del NFT
        let creator = vec![Creator {
            address: ctx.accounts.authority.key(),
            verified: true,
            share: 100,
        }];

        let data_v2 = DataV2 {
            name: format!("KYC Verification - {}", verification_level.to_string()),
            symbol: "KYC".to_string(),
            uri: metadata_uri.clone(),
            seller_fee_basis_points: 0,
            creators: Some(creator),
            collection: Some(anchor_spl::metadata::mpl_token_metadata::types::Collection {
                verified: false,
                key: ctx.accounts.collection_mint.key(),
            }),
            uses: None,
        };

        let authority_seeds = &[
            b"authority",
            &[ctx.bumps.kyc_authority],
        ];
        let signer_seeds = &[&authority_seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.kyc_authority.to_account_info(),
                update_authority: ctx.accounts.kyc_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        );

        create_metadata_accounts_v3(cpi_context, data_v2, true, true, None)?;

        // Crear Master Edition (hace que sea NFT no fungible)
        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                update_authority: ctx.accounts.kyc_authority.to_account_info(),
                mint_authority: ctx.accounts.kyc_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        );

        create_master_edition_v3(cpi_context, Some(0))?;

        // Guardar registro KYC
        kyc_record.user = ctx.accounts.user.key();
        kyc_record.mint = ctx.accounts.mint.key();
        kyc_record.user_name = user_name;
        kyc_record.user_id = user_id;
        kyc_record.verification_level = verification_level;
        kyc_record.issued_at = Clock::get()?.unix_timestamp;
        kyc_record.expires_at = None; // Sin expiración por defecto
        kyc_record.is_valid = true;
        kyc_record.metadata_uri = metadata_uri;

        kyc_authority.total_issued += 1;

        msg!("KYC NFT emitido para usuario: {}", ctx.accounts.user.key());
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Nivel: {:?}", verification_level);

        Ok(())
    }

    /// Revocar NFT de KYC
    pub fn revoke_kyc_nft(ctx: Context<RevokeKycNft>, reason: String) -> Result<()> {
        let kyc_record = &mut ctx.accounts.kyc_record;
        let kyc_authority = &mut ctx.accounts.kyc_authority;

        require!(kyc_record.is_valid, ErrorCode::AlreadyRevoked);

        kyc_record.is_valid = false;
        kyc_record.revoked_at = Some(Clock::get()?.unix_timestamp);
        kyc_record.revocation_reason = Some(reason);

        kyc_authority.total_revoked += 1;

        msg!("KYC NFT revocado para usuario: {}", kyc_record.user);
        msg!("Mint: {}", kyc_record.mint);

        Ok(())
    }

    /// Renovar/actualizar KYC NFT
    pub fn renew_kyc_nft(
        ctx: Context<RenewKycNft>,
        new_expiration: Option<i64>,
    ) -> Result<()> {
        let kyc_record = &mut ctx.accounts.kyc_record;

        require!(kyc_record.is_valid, ErrorCode::KycRevoked);

        kyc_record.expires_at = new_expiration;
        kyc_record.last_updated = Some(Clock::get()?.unix_timestamp);

        msg!("KYC NFT renovado para usuario: {}", kyc_record.user);

        Ok(())
    }

    /// Verificar si un usuario tiene KYC válido
    pub fn verify_kyc_status(ctx: Context<VerifyKycStatus>) -> Result<()> {
        let kyc_record = &ctx.accounts.kyc_record;

        require!(kyc_record.is_valid, ErrorCode::KycRevoked);

        if let Some(expires_at) = kyc_record.expires_at {
            let current_time = Clock::get()?.unix_timestamp;
            require!(current_time < expires_at, ErrorCode::KycExpired);
        }

        msg!("✅ KYC válido para usuario: {}", kyc_record.user);
        msg!("   Nivel: {:?}", kyc_record.verification_level);
        msg!("   Emitido: {}", kyc_record.issued_at);

        Ok(())
    }
}

// ============================================================================
// CONTEXTS
// ============================================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + KycAuthority::INIT_SPACE,
        seeds = [b"authority"],
        bump
    )]
    pub kyc_authority: Account<'info, KycAuthority>,

    /// Collection mint para todos los KYC NFTs
    pub collection_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(user_name: String)]
pub struct IssueKycNft<'info> {
    #[account(
        mut,
        seeds = [b"authority"],
        bump
    )]
    pub kyc_authority: Account<'info, KycAuthority>,

    #[account(
        init,
        payer = payer,
        space = 8 + KycRecord::INIT_SPACE,
        seeds = [b"kyc_record", user.key().as_ref()],
        bump
    )]
    pub kyc_record: Account<'info, KycRecord>,

    /// Usuario que recibirá el NFT
    pub user: SystemAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = kyc_authority,
        mint::freeze_authority = kyc_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: Metadata account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Master edition account
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    /// Collection mint
    pub collection_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, MetadataProgram>,
}

#[derive(Accounts)]
pub struct RevokeKycNft<'info> {
    #[account(
        mut,
        seeds = [b"authority"],
        bump
    )]
    pub kyc_authority: Account<'info, KycAuthority>,

    #[account(
        mut,
        seeds = [b"kyc_record", kyc_record.user.as_ref()],
        bump
    )]
    pub kyc_record: Account<'info, KycRecord>,

    #[account(constraint = authority.key() == kyc_authority.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RenewKycNft<'info> {
    #[account(
        seeds = [b"authority"],
        bump
    )]
    pub kyc_authority: Account<'info, KycAuthority>,

    #[account(
        mut,
        seeds = [b"kyc_record", kyc_record.user.as_ref()],
        bump
    )]
    pub kyc_record: Account<'info, KycRecord>,

    #[account(constraint = authority.key() == kyc_authority.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyKycStatus<'info> {
    #[account(
        seeds = [b"kyc_record", user.key().as_ref()],
        bump
    )]
    pub kyc_record: Account<'info, KycRecord>,

    pub user: SystemAccount<'info>,
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct KycAuthority {
    pub authority: Pubkey,
    pub total_issued: u64,
    pub total_revoked: u64,
    pub collection_mint: Pubkey,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct KycRecord {
    pub user: Pubkey,
    pub mint: Pubkey,
    #[max_len(100)]
    pub user_name: String,
    #[max_len(50)]
    pub user_id: String,
    pub verification_level: VerificationLevel,
    pub issued_at: i64,
    pub expires_at: Option<i64>,
    pub last_updated: Option<i64>,
    pub is_valid: bool,
    pub revoked_at: Option<i64>,
    #[max_len(200)]
    pub revocation_reason: Option<String>,
    #[max_len(200)]
    pub metadata_uri: String,
}

// ============================================================================
// ENUMS
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum VerificationLevel {
    Basic,      // Verificación básica (email, teléfono)
    Standard,   // Verificación estándar (+ ID)
    Enhanced,   // Verificación mejorada (+ prueba de domicilio)
    Premium,    // Verificación premium (+ biometría)
}

impl VerificationLevel {
    pub fn to_string(&self) -> &str {
        match self {
            Self::Basic => "Basic",
            Self::Standard => "Standard",
            Self::Enhanced => "Enhanced",
            Self::Premium => "Premium",
        }
    }
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("System is not active")]
    SystemNotActive,

    #[msg("KYC already revoked")]
    AlreadyRevoked,

    #[msg("KYC has been revoked")]
    KycRevoked,

    #[msg("KYC has expired")]
    KycExpired,

    #[msg("Invalid verification level")]
    InvalidVerificationLevel,
}
