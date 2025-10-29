use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun");

// Constantes del sistema
const MAX_TRANSACTION_AMOUNT_MXN: u64 = 9_000_000_000; // 9,000 MXN en formato decimal (con 6 decimales)
const PLATFORM_FEE_BPS: u64 = 50; // 0.5% de comisión (50 basis points)
const DISPUTE_DEPOSIT_LAMPORTS: u64 = 10_000_000; // 0.01 SOL para abrir disputa

#[program]
pub mod tipjar {
    use super::*;

    /// Inicializar la plataforma (solo una vez, por la autoridad)
    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.fee_bps = PLATFORM_FEE_BPS;
        platform.total_volume = 0;
        platform.total_transactions = 0;
        platform.treasury = ctx.accounts.treasury.key();
        platform.is_active = true;

        msg!("Platform initialized with authority: {}", platform.authority);
        Ok(())
    }

    /// Crear perfil de usuario con verificación KYC
    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        kyc_verified: bool,
        kyc_nft_mint: Option<Pubkey>, // Mint del NFT de verificación KYC
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.owner = ctx.accounts.user.key();
        profile.kyc_verified = kyc_verified;
        profile.kyc_nft_mint = kyc_nft_mint;
        profile.total_trades = 0;
        profile.successful_trades = 0;
        profile.disputed_trades = 0;
        profile.is_active = true;
        profile.created_at = Clock::get()?.unix_timestamp;

        msg!("User profile created for: {}", profile.owner);
        Ok(())
    }

    /// Crear una orden P2P (oferta de venta de crypto por MXN)
    pub fn create_order(
        ctx: Context<CreateOrder>,
        order_id: String,
        amount: u64, // Cantidad en tokens/SOL (con decimales)
        amount_mxn: u64, // Cantidad equivalente en MXN (con 6 decimales)
        token_type: TokenType,
        payment_method: PaymentMethod,
        stp_reference: String, // Referencia para integración con STP
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(amount_mxn > 0 && amount_mxn <= MAX_TRANSACTION_AMOUNT_MXN, ErrorCode::ExceedsMaxLimit);
        require!(ctx.accounts.seller_profile.kyc_verified, ErrorCode::KYCRequired);
        require!(ctx.accounts.seller_profile.is_active, ErrorCode::UserNotActive);

        let order = &mut ctx.accounts.order;
        order.order_id = order_id;
        order.seller = ctx.accounts.seller.key();
        order.buyer = None;
        order.amount = amount;
        order.amount_mxn = amount_mxn;
        order.token_type = token_type;
        order.payment_method = payment_method;
        order.status = OrderStatus::Open;
        order.stp_reference = stp_reference;
        order.stp_oracle_confirmed = false;
        order.created_at = Clock::get()?.unix_timestamp;
        order.escrow = ctx.accounts.escrow.key();

        msg!("Order created: {} for {} MXN", order.order_id, amount_mxn);
        Ok(())
    }

    /// Aceptar una orden (buyer acepta comprar crypto)
    pub fn accept_order(ctx: Context<AcceptOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(order.status == OrderStatus::Open, ErrorCode::OrderNotOpen);
        require!(ctx.accounts.buyer_profile.kyc_verified, ErrorCode::KYCRequired);
        require!(ctx.accounts.buyer_profile.is_active, ErrorCode::UserNotActive);
        require!(order.seller != ctx.accounts.buyer.key(), ErrorCode::CannotTradeWithSelf);

        order.buyer = Some(ctx.accounts.buyer.key());
        order.status = OrderStatus::Accepted;
        order.accepted_at = Some(Clock::get()?.unix_timestamp);

        msg!("Order {} accepted by buyer: {}", order.order_id, ctx.accounts.buyer.key());
        Ok(())
    }

    /// Depositar fondos en escrow (seller deposita crypto)
    pub fn deposit_to_escrow_native(ctx: Context<DepositToEscrowNative>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(order.status == OrderStatus::Accepted, ErrorCode::InvalidOrderStatus);
        require!(order.token_type == TokenType::SOL, ErrorCode::InvalidTokenType);
        require!(order.seller == ctx.accounts.seller.key(), ErrorCode::UnauthorizedSeller);

        // Transferir SOL del seller al escrow
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.seller.key(),
            &ctx.accounts.escrow.key(),
            order.amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.seller.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        order.status = OrderStatus::Funded;
        order.funded_at = Some(Clock::get()?.unix_timestamp);

        msg!("SOL deposited to escrow for order: {}", order.order_id);
        Ok(())
    }

    /// Depositar tokens SPL en escrow (USDC/USDT)
    pub fn deposit_to_escrow_spl(ctx: Context<DepositToEscrowSPL>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(order.status == OrderStatus::Accepted, ErrorCode::InvalidOrderStatus);
        require!(order.token_type != TokenType::SOL, ErrorCode::InvalidTokenType);
        require!(order.seller == ctx.accounts.seller.key(), ErrorCode::UnauthorizedSeller);

        // Transferir SPL tokens del seller al escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, order.amount)?;

        order.status = OrderStatus::Funded;
        order.funded_at = Some(Clock::get()?.unix_timestamp);

        msg!("SPL tokens deposited to escrow for order: {}", order.order_id);
        Ok(())
    }

    /// Confirmar pago fiat (buyer confirma que envió MXN via STP)
    pub fn confirm_fiat_payment(ctx: Context<ConfirmFiatPayment>, stp_transaction_id: String) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(order.status == OrderStatus::Funded, ErrorCode::InvalidOrderStatus);
        require!(order.buyer == Some(ctx.accounts.buyer.key()), ErrorCode::UnauthorizedBuyer);

        order.stp_transaction_id = Some(stp_transaction_id.clone());
        order.status = OrderStatus::PaymentConfirmed;
        order.payment_confirmed_at = Some(Clock::get()?.unix_timestamp);

        msg!("Fiat payment confirmed for order: {} with STP ID: {}", order.order_id, stp_transaction_id);
        Ok(())
    }

    /// Liberar fondos del escrow (después de confirmación del oráculo STP)
    /// Solo puede ser llamado por el oráculo autorizado o después de timeout
    pub fn release_funds_native(ctx: Context<ReleaseFundsNative>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let platform = &ctx.accounts.platform;

        require!(order.status == OrderStatus::PaymentConfirmed, ErrorCode::InvalidOrderStatus);
        require!(order.token_type == TokenType::SOL, ErrorCode::InvalidTokenType);

        // Verificar que es el oráculo o ha pasado suficiente tiempo
        let is_oracle = ctx.accounts.authority.key() == platform.authority;
        let is_timeout = if let Some(confirmed_at) = order.payment_confirmed_at {
            Clock::get()?.unix_timestamp - confirmed_at > 86400 // 24 horas
        } else {
            false
        };

        require!(is_oracle || is_timeout, ErrorCode::Unauthorized);

        // Calcular comisión
        let fee_amount = (order.amount * platform.fee_bps) / 10000;
        let buyer_amount = order.amount - fee_amount;

        // Transferir SOL del escrow al buyer
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= buyer_amount;
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? += buyer_amount;

        // Transferir comisión al treasury
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= fee_amount;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += fee_amount;

        order.status = OrderStatus::Completed;
        order.completed_at = Some(Clock::get()?.unix_timestamp);
        order.stp_oracle_confirmed = true;

        // Actualizar perfiles
        let seller_profile = &mut ctx.accounts.seller_profile;
        seller_profile.total_trades += 1;
        seller_profile.successful_trades += 1;

        let buyer_profile = &mut ctx.accounts.buyer_profile;
        buyer_profile.total_trades += 1;
        buyer_profile.successful_trades += 1;

        msg!("Funds released for order: {}", order.order_id);
        Ok(())
    }

    /// Liberar fondos SPL del escrow
    pub fn release_funds_spl(ctx: Context<ReleaseFundsSPL>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let platform = &ctx.accounts.platform;

        require!(order.status == OrderStatus::PaymentConfirmed, ErrorCode::InvalidOrderStatus);
        require!(order.token_type != TokenType::SOL, ErrorCode::InvalidTokenType);

        let is_oracle = ctx.accounts.authority.key() == platform.authority;
        let is_timeout = if let Some(confirmed_at) = order.payment_confirmed_at {
            Clock::get()?.unix_timestamp - confirmed_at > 86400
        } else {
            false
        };

        require!(is_oracle || is_timeout, ErrorCode::Unauthorized);

        // Calcular comisión
        let fee_amount = (order.amount * platform.fee_bps) / 10000;
        let buyer_amount = order.amount - fee_amount;

        // Transferir tokens al buyer
        let escrow_bump = ctx.bumps.escrow;
        let order_key = order.key();
        let escrow_seeds = &[
            b"escrow",
            order_key.as_ref(),
            &[escrow_bump],
        ];
        let signer_seeds = &[&escrow_seeds[..]];

        let transfer_to_buyer = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_to_buyer,
            signer_seeds,
        );

        token::transfer(cpi_ctx, buyer_amount)?;

        // Transferir comisión al treasury
        let transfer_fee = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        let cpi_ctx_fee = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_fee,
            signer_seeds,
        );

        token::transfer(cpi_ctx_fee, fee_amount)?;

        order.status = OrderStatus::Completed;
        order.completed_at = Some(Clock::get()?.unix_timestamp);
        order.stp_oracle_confirmed = true;

        // Actualizar perfiles
        let seller_profile = &mut ctx.accounts.seller_profile;
        seller_profile.total_trades += 1;
        seller_profile.successful_trades += 1;

        let buyer_profile = &mut ctx.accounts.buyer_profile;
        buyer_profile.total_trades += 1;
        buyer_profile.successful_trades += 1;

        msg!("SPL funds released for order: {}", order.order_id);
        Ok(())
    }

    /// Abrir una disputa
    pub fn open_dispute(
        ctx: Context<OpenDispute>,
        reason: String,
        evidence: String,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Funded || order.status == OrderStatus::PaymentConfirmed,
            ErrorCode::InvalidOrderStatus
        );

        let initiator = ctx.accounts.initiator.key();
        require!(
            initiator == order.seller || Some(initiator) == order.buyer,
            ErrorCode::Unauthorized
        );

        // Cobrar depósito por disputa
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.initiator.key(),
            &ctx.accounts.dispute.key(),
            DISPUTE_DEPOSIT_LAMPORTS,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.initiator.to_account_info(),
                ctx.accounts.dispute.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let dispute = &mut ctx.accounts.dispute;
        dispute.order = order.key();
        dispute.initiator = initiator;
        dispute.reason = reason;
        dispute.evidence = evidence;
        dispute.status = DisputeStatus::Open;
        dispute.created_at = Clock::get()?.unix_timestamp;
        dispute.resolver = None;
        dispute.resolution = None;

        order.status = OrderStatus::Disputed;

        // Actualizar perfil
        if initiator == order.seller {
            ctx.accounts.seller_profile.disputed_trades += 1;
        } else {
            ctx.accounts.buyer_profile.disputed_trades += 1;
        }

        msg!("Dispute opened for order: {}", order.order_id);
        Ok(())
    }

    /// Resolver una disputa (solo autoridad/arbitro)
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        resolution: DisputeResolution,
        resolution_notes: String,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        let platform = &ctx.accounts.platform;

        require!(dispute.status == DisputeStatus::Open, ErrorCode::DisputeAlreadyResolved);
        require!(ctx.accounts.resolver.key() == platform.authority, ErrorCode::Unauthorized);

        dispute.resolver = Some(ctx.accounts.resolver.key());
        dispute.resolution = Some(resolution);
        dispute.status = DisputeStatus::Resolved;
        dispute.resolved_at = Some(Clock::get()?.unix_timestamp);
        dispute.resolution_notes = Some(resolution_notes);

        let order = &mut ctx.accounts.order;

        // Actualizar estado según resolución
        match resolution {
            DisputeResolution::FavorBuyer => {
                order.status = OrderStatus::Completed;
                // Los fondos se liberarán al buyer en release_funds
            },
            DisputeResolution::FavorSeller => {
                order.status = OrderStatus::Cancelled;
                // Los fondos se devolverán al seller en cancel_order
            },
            DisputeResolution::Split => {
                order.status = OrderStatus::PartialRefund;
                // Implementar lógica de split 50/50
            },
        }

        msg!("Dispute resolved for order: {}", order.order_id);
        Ok(())
    }

    /// Cancelar orden y devolver fondos (SOL)
    pub fn cancel_order_native(ctx: Context<CancelOrderNative>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Funded || order.status == OrderStatus::Cancelled,
            ErrorCode::InvalidOrderStatus
        );
        require!(order.seller == ctx.accounts.seller.key(), ErrorCode::UnauthorizedSeller);

        // Devolver SOL del escrow al seller
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= order.amount;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += order.amount;

        order.status = OrderStatus::Cancelled;

        msg!("Order {} cancelled and funds returned", order.order_id);
        Ok(())
    }

    /// Cancelar orden y devolver fondos (SPL tokens)
    pub fn cancel_order_spl(ctx: Context<CancelOrderSPL>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Funded || order.status == OrderStatus::Cancelled,
            ErrorCode::InvalidOrderStatus
        );
        require!(order.seller == ctx.accounts.seller.key(), ErrorCode::UnauthorizedSeller);
        require!(order.token_type != TokenType::SOL, ErrorCode::InvalidTokenType);

        // Devolver SPL tokens del escrow al seller
        let escrow_bump = ctx.bumps.escrow;
        let order_key = order.key();
        let escrow_seeds = &[
            b"escrow",
            order_key.as_ref(),
            &[escrow_bump],
        ];
        let signer_seeds = &[&escrow_seeds[..]];

        let transfer_back = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_back,
            signer_seeds,
        );

        token::transfer(cpi_ctx, order.amount)?;

        order.status = OrderStatus::Cancelled;

        msg!("Order {} cancelled and SPL tokens returned", order.order_id);
        Ok(())
    }

    /// Resolver disputa con división 50/50 (SOL)
    pub fn resolve_dispute_split_native(ctx: Context<ResolveDisputeSplitNative>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let platform = &ctx.accounts.platform;

        require!(order.status == OrderStatus::Disputed, ErrorCode::InvalidOrderStatus);
        require!(ctx.accounts.resolver.key() == platform.authority, ErrorCode::Unauthorized);
        require!(order.token_type == TokenType::SOL, ErrorCode::InvalidTokenType);

        // Dividir fondos 50/50 después de descontar comisión
        let fee_amount = (order.amount * platform.fee_bps) / 10000;
        let remaining = order.amount - fee_amount;
        let seller_amount = remaining / 2;
        let buyer_amount = remaining - seller_amount;

        // Transferir al seller
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= seller_amount;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += seller_amount;

        // Transferir al buyer
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= buyer_amount;
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? += buyer_amount;

        // Transferir comisión al treasury
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= fee_amount;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += fee_amount;

        order.status = OrderStatus::PartialRefund;

        msg!("Dispute resolved with 50/50 split for order: {}", order.order_id);
        Ok(())
    }

    /// Resolver disputa con división 50/50 (SPL tokens)
    pub fn resolve_dispute_split_spl(ctx: Context<ResolveDisputeSplitSPL>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let platform = &ctx.accounts.platform;

        require!(order.status == OrderStatus::Disputed, ErrorCode::InvalidOrderStatus);
        require!(ctx.accounts.resolver.key() == platform.authority, ErrorCode::Unauthorized);
        require!(order.token_type != TokenType::SOL, ErrorCode::InvalidTokenType);

        // Calcular división
        let fee_amount = (order.amount * platform.fee_bps) / 10000;
        let remaining = order.amount - fee_amount;
        let seller_amount = remaining / 2;
        let buyer_amount = remaining - seller_amount;

        let escrow_bump = ctx.bumps.escrow;
        let order_key = order.key();
        let escrow_seeds = &[
            b"escrow",
            order_key.as_ref(),
            &[escrow_bump],
        ];
        let signer_seeds = &[&escrow_seeds[..]];

        // Transferir al seller
        let transfer_to_seller = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        let cpi_ctx_seller = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_to_seller,
            signer_seeds,
        );

        token::transfer(cpi_ctx_seller, seller_amount)?;

        // Transferir al buyer
        let transfer_to_buyer = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        let cpi_ctx_buyer = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_to_buyer,
            signer_seeds,
        );

        token::transfer(cpi_ctx_buyer, buyer_amount)?;

        // Transferir comisión al treasury
        let transfer_fee = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        let cpi_ctx_fee = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_fee,
            signer_seeds,
        );

        token::transfer(cpi_ctx_fee, fee_amount)?;

        order.status = OrderStatus::PartialRefund;

        msg!("Dispute resolved with 50/50 split for order: {}", order.order_id);
        Ok(())
    }

    /// Actualizar estado del oráculo STP (solo para autoridad/oráculo)
    pub fn update_oracle_status(
        ctx: Context<UpdateOracleStatus>,
        confirmed: bool,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let platform = &ctx.accounts.platform;

        require!(ctx.accounts.oracle.key() == platform.authority, ErrorCode::Unauthorized);

        order.stp_oracle_confirmed = confirmed;

        msg!("Oracle status updated for order: {} to {}", order.order_id, confirmed);
        Ok(())
    }
}

// ============================================================================
// CONTEXTOS DE INSTRUCCIONES
// ============================================================================

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury para recibir comisiones
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(order_id: String)]
pub struct CreateOrder<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + Order::INIT_SPACE,
        seeds = [b"order", order_id.as_bytes()],
        bump
    )]
    pub order: Account<'info, Order>,

    /// CHECK: This is a PDA used as escrow wallet, validated by seeds
    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"user_profile", seller.key().as_ref()],
        bump
    )]
    pub seller_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptOrder<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"user_profile", buyer.key().as_ref()],
        bump
    )]
    pub buyer_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositToEscrowNative<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositToEscrowSPL<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ConfirmFiatPayment<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(mut)]
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseFundsNative<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    /// CHECK: Buyer que recibe los fondos
    #[account(mut)]
    pub buyer: AccountInfo<'info>,

    /// CHECK: Treasury de la plataforma
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"user_profile", order.seller.as_ref()],
        bump
    )]
    pub seller_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", order.buyer.unwrap().as_ref()],
        bump
    )]
    pub buyer_profile: Account<'info, UserProfile>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseFundsSPL<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"user_profile", order.seller.as_ref()],
        bump
    )]
    pub seller_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", order.buyer.unwrap().as_ref()],
        bump
    )]
    pub buyer_profile: Account<'info, UserProfile>,

    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(
        init,
        payer = initiator,
        space = 8 + Dispute::INIT_SPACE,
        seeds = [b"dispute", order.key().as_ref()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"user_profile", order.seller.as_ref()],
        bump
    )]
    pub seller_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", order.buyer.unwrap().as_ref()],
        bump
    )]
    pub buyer_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub initiator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub dispute: Account<'info, Dispute>,

    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    pub resolver: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelOrderNative<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelOrderSPL<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveDisputeSplitNative<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    /// CHECK: Seller que recibe mitad de fondos
    #[account(mut)]
    pub seller: AccountInfo<'info>,

    /// CHECK: Buyer que recibe mitad de fondos
    #[account(mut)]
    pub buyer: AccountInfo<'info>,

    /// CHECK: Treasury de la plataforma
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    pub resolver: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveDisputeSplitSPL<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        mut,
        seeds = [b"escrow", order.key().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub resolver: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateOracleStatus<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,

    #[account(
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    pub oracle: Signer<'info>,
}

// ============================================================================
// ESTRUCTURAS DE DATOS
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,          // Autoridad de la plataforma
    pub treasury: Pubkey,            // Cuenta para recibir comisiones
    pub fee_bps: u64,                // Comisión en basis points (100 = 1%)
    pub total_volume: u64,           // Volumen total procesado
    pub total_transactions: u64,     // Total de transacciones
    pub is_active: bool,             // Estado de la plataforma
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub owner: Pubkey,               // Wallet del usuario
    pub kyc_verified: bool,          // Si el usuario pasó KYC
    pub kyc_nft_mint: Option<Pubkey>, // NFT de verificación KYC
    pub total_trades: u64,           // Total de trades
    pub successful_trades: u64,      // Trades exitosos
    pub disputed_trades: u64,        // Trades en disputa
    pub is_active: bool,             // Si el usuario está activo
    pub created_at: i64,             // Timestamp de creación
}

#[account]
#[derive(InitSpace)]
pub struct Order {
    #[max_len(50)]
    pub order_id: String,            // ID único de la orden
    pub seller: Pubkey,              // Vendedor de crypto
    pub buyer: Option<Pubkey>,       // Comprador de crypto
    pub amount: u64,                 // Cantidad en tokens/SOL
    pub amount_mxn: u64,             // Cantidad en MXN (con decimales)
    pub token_type: TokenType,       // Tipo de token (SOL, USDC, USDT)
    pub payment_method: PaymentMethod, // Método de pago
    pub status: OrderStatus,         // Estado de la orden
    #[max_len(100)]
    pub stp_reference: String,       // Referencia STP para el pago
    #[max_len(100)]
    pub stp_transaction_id: Option<String>, // ID de transacción STP
    pub stp_oracle_confirmed: bool,  // Si el oráculo confirmó el pago STP
    pub escrow: Pubkey,              // Cuenta escrow
    pub created_at: i64,             // Timestamp de creación
    pub accepted_at: Option<i64>,    // Timestamp de aceptación
    pub funded_at: Option<i64>,      // Timestamp de fondeo
    pub payment_confirmed_at: Option<i64>, // Timestamp de confirmación de pago
    pub completed_at: Option<i64>,   // Timestamp de completado
}

#[account]
#[derive(InitSpace)]
pub struct Dispute {
    pub order: Pubkey,               // Orden en disputa
    pub initiator: Pubkey,           // Quien inició la disputa
    #[max_len(500)]
    pub reason: String,              // Razón de la disputa
    #[max_len(1000)]
    pub evidence: String,            // Evidencia (URLs, hashes, etc.)
    pub status: DisputeStatus,       // Estado de la disputa
    pub resolver: Option<Pubkey>,    // Quien resolvió la disputa
    pub resolution: Option<DisputeResolution>, // Resolución
    #[max_len(1000)]
    pub resolution_notes: Option<String>, // Notas de la resolución
    pub created_at: i64,             // Timestamp de creación
    pub resolved_at: Option<i64>,    // Timestamp de resolución
}

// ============================================================================
// ENUMS
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum TokenType {
    SOL,
    USDC,
    USDT,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum PaymentMethod {
    STP,        // Sistema de Transferencias y Pagos
    SPEI,       // Sistema de Pagos Electrónicos Interbancarios
    Cash,       // Efectivo en punto físico
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum OrderStatus {
    Open,              // Orden creada, esperando buyer
    Accepted,          // Buyer aceptó la orden
    Funded,            // Seller depositó crypto en escrow
    PaymentConfirmed,  // Buyer confirmó pago fiat
    Completed,         // Transacción completada
    Cancelled,         // Orden cancelada
    Disputed,          // En disputa
    PartialRefund,     // Reembolso parcial (split)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DisputeStatus {
    Open,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum DisputeResolution {
    FavorBuyer,   // Fondos van al buyer
    FavorSeller,  // Fondos regresan al seller
    Split,        // División 50/50
}

// ============================================================================
// CÓDIGOS DE ERROR
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Amount exceeds maximum limit of 9,000 MXN")]
    ExceedsMaxLimit,

    #[msg("KYC verification required")]
    KYCRequired,

    #[msg("User is not active")]
    UserNotActive,

    #[msg("Order is not open")]
    OrderNotOpen,

    #[msg("Invalid order status")]
    InvalidOrderStatus,

    #[msg("Invalid token type")]
    InvalidTokenType,

    #[msg("Unauthorized seller")]
    UnauthorizedSeller,

    #[msg("Unauthorized buyer")]
    UnauthorizedBuyer,

    #[msg("Cannot trade with yourself")]
    CannotTradeWithSelf,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Dispute already resolved")]
    DisputeAlreadyResolved,
}
