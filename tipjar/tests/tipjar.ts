import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Tipjar } from "../target/types/tipjar";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("P2P Payment System Tests", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tipjar as Program<Tipjar>;

  // Test accounts
  const authority = provider.wallet as anchor.Wallet;
  const treasury = Keypair.generate();
  const seller = Keypair.generate();
  const buyer = Keypair.generate();
  const arbiter = authority;

  // PDAs
  let platformPda: PublicKey;
  let sellerProfilePda: PublicKey;
  let buyerProfilePda: PublicKey;

  // Order IDs
  const orderId1 = "ORDER_001_SOL";
  const orderId2 = "ORDER_002_USDC";

  let orderPda1: PublicKey;
  let escrowPda1: PublicKey;
  let orderPda2: PublicKey;
  let escrowPda2: PublicKey;

  // SPL Token
  let usdcMint: PublicKey;
  let sellerTokenAccount: PublicKey;
  let buyerTokenAccount: PublicKey;
  let escrowTokenAccount: PublicKey;
  let treasuryTokenAccount: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    const airdropAmount = 10 * LAMPORTS_PER_SOL;

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(seller.publicKey, airdropAmount)
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer.publicKey, airdropAmount)
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(treasury.publicKey, airdropAmount)
    );

    // Derive PDAs
    [platformPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    [sellerProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), seller.publicKey.toBuffer()],
      program.programId
    );

    [buyerProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), buyer.publicKey.toBuffer()],
      program.programId
    );

    [orderPda1] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), Buffer.from(orderId1)],
      program.programId
    );

    [escrowPda1] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), orderPda1.toBuffer()],
      program.programId
    );

    [orderPda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), Buffer.from(orderId2)],
      program.programId
    );

    [escrowPda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), orderPda2.toBuffer()],
      program.programId
    );

    // Create USDC mock token
    usdcMint = await createMint(
      provider.connection,
      authority.payer,
      authority.publicKey,
      null,
      6 // USDC has 6 decimals
    );

    // Create token accounts
    sellerTokenAccount = await createAccount(
      provider.connection,
      authority.payer,
      usdcMint,
      seller.publicKey
    );

    buyerTokenAccount = await createAccount(
      provider.connection,
      authority.payer,
      usdcMint,
      buyer.publicKey
    );

    treasuryTokenAccount = await createAccount(
      provider.connection,
      authority.payer,
      usdcMint,
      treasury.publicKey
    );

    // Mint USDC to seller (1000 USDC)
    await mintTo(
      provider.connection,
      authority.payer,
      usdcMint,
      sellerTokenAccount,
      authority.publicKey,
      1000 * 1_000_000 // 1000 USDC with 6 decimals
    );

    console.log("✅ Setup completado");
    console.log("Platform PDA:", platformPda.toString());
    console.log("Seller:", seller.publicKey.toString());
    console.log("Buyer:", buyer.publicKey.toString());
    console.log("USDC Mint:", usdcMint.toString());
  });

  describe("1. Inicialización de Plataforma", () => {
    it("Debe inicializar la plataforma correctamente", async () => {
      await program.methods
        .initializePlatform()
        .accounts({
          platform: platformPda,
          authority: authority.publicKey,
          treasury: treasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const platform = await program.account.platform.fetch(platformPda);

      assert.equal(platform.authority.toString(), authority.publicKey.toString());
      assert.equal(platform.treasury.toString(), treasury.publicKey.toString());
      assert.equal(platform.feeBps.toNumber(), 50); // 0.5%
      assert.equal(platform.isActive, true);

      console.log("✅ Plataforma inicializada con comisión:", platform.feeBps.toNumber(), "bps");
    });
  });

  describe("2. Creación de Perfiles de Usuario", () => {
    it("Debe crear perfil de seller con KYC verificado", async () => {
      await program.methods
        .createUserProfile(true, null)
        .accounts({
          userProfile: sellerProfilePda,
          user: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const profile = await program.account.userProfile.fetch(sellerProfilePda);

      assert.equal(profile.owner.toString(), seller.publicKey.toString());
      assert.equal(profile.kycVerified, true);
      assert.equal(profile.totalTrades.toNumber(), 0);

      console.log("✅ Perfil de seller creado con KYC");
    });

    it("Debe crear perfil de buyer con KYC verificado", async () => {
      await program.methods
        .createUserProfile(true, null)
        .accounts({
          userProfile: buyerProfilePda,
          user: buyer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      const profile = await program.account.userProfile.fetch(buyerProfilePda);

      assert.equal(profile.owner.toString(), buyer.publicKey.toString());
      assert.equal(profile.kycVerified, true);

      console.log("✅ Perfil de buyer creado con KYC");
    });
  });

  describe("3. Flujo Completo P2P con SOL", () => {
    const amount = new BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
    const amountMxn = new BN(2_000_000_000); // 2,000 MXN (6 decimals)

    it("Debe crear orden de venta de SOL", async () => {
      await program.methods
        .createOrder(
          orderId1,
          amount,
          amountMxn,
          { sol: {} },
          { stp: {} },
          "STP_REF_001"
        )
        .accounts({
          order: orderPda1,
          escrow: escrowPda1,
          sellerProfile: sellerProfilePda,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const order = await program.account.order.fetch(orderPda1);

      assert.equal(order.orderId, orderId1);
      assert.equal(order.seller.toString(), seller.publicKey.toString());
      assert.equal(order.amount.toString(), amount.toString());
      assert.equal(order.amountMxn.toString(), amountMxn.toString());
      assert.deepEqual(order.status, { open: {} });

      console.log("✅ Orden creada:", orderId1);
    });

    it("Buyer debe aceptar la orden", async () => {
      await program.methods
        .acceptOrder()
        .accounts({
          order: orderPda1,
          buyerProfile: buyerProfilePda,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();

      const order = await program.account.order.fetch(orderPda1);

      assert.equal(order.buyer?.toString(), buyer.publicKey.toString());
      assert.deepEqual(order.status, { accepted: {} });

      console.log("✅ Orden aceptada por buyer");
    });

    it("Seller debe depositar SOL en escrow", async () => {
      const escrowBalanceBefore = await provider.connection.getBalance(escrowPda1);

      await program.methods
        .depositToEscrowNative()
        .accounts({
          order: orderPda1,
          escrow: escrowPda1,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const order = await program.account.order.fetch(orderPda1);
      const escrowBalanceAfter = await provider.connection.getBalance(escrowPda1);

      assert.deepEqual(order.status, { funded: {} });
      assert.equal(escrowBalanceAfter - escrowBalanceBefore, amount.toNumber());

      console.log("✅ SOL depositado en escrow:", amount.toNumber() / LAMPORTS_PER_SOL, "SOL");
    });

    it("Buyer debe confirmar pago fiat", async () => {
      await program.methods
        .confirmFiatPayment("STP_TX_12345678")
        .accounts({
          order: orderPda1,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();

      const order = await program.account.order.fetch(orderPda1);

      assert.deepEqual(order.status, { paymentConfirmed: {} });
      assert.equal(order.stpTransactionId, "STP_TX_12345678");

      console.log("✅ Pago fiat confirmado con ID:", order.stpTransactionId);
    });

    it("Oráculo debe actualizar estado de confirmación", async () => {
      await program.methods
        .updateOracleStatus(true)
        .accounts({
          order: orderPda1,
          platform: platformPda,
          oracle: authority.publicKey,
        })
        .rpc();

      const order = await program.account.order.fetch(orderPda1);

      assert.equal(order.stpOracleConfirmed, true);

      console.log("✅ Oráculo confirmó el pago STP");
    });

    it("Debe liberar fondos al buyer", async () => {
      const buyerBalanceBefore = await provider.connection.getBalance(buyer.publicKey);
      const treasuryBalanceBefore = await provider.connection.getBalance(treasury.publicKey);

      await program.methods
        .releaseFundsNative()
        .accounts({
          order: orderPda1,
          escrow: escrowPda1,
          platform: platformPda,
          buyer: buyer.publicKey,
          treasury: treasury.publicKey,
          sellerProfile: sellerProfilePda,
          buyerProfile: buyerProfilePda,
          authority: authority.publicKey,
        })
        .rpc();

      const order = await program.account.order.fetch(orderPda1);
      const buyerBalanceAfter = await provider.connection.getBalance(buyer.publicKey);
      const treasuryBalanceAfter = await provider.connection.getBalance(treasury.publicKey);

      const fee = amount.toNumber() * 50 / 10000; // 0.5%
      const buyerAmount = amount.toNumber() - fee;

      assert.deepEqual(order.status, { completed: {} });
      assert.approximately(
        buyerBalanceAfter - buyerBalanceBefore,
        buyerAmount,
        1000 // Margen de error por fees de transacción
      );
      assert.approximately(
        treasuryBalanceAfter - treasuryBalanceBefore,
        fee,
        1000
      );

      // Verificar estadísticas de perfiles
      const sellerProfile = await program.account.userProfile.fetch(sellerProfilePda);
      const buyerProfile = await program.account.userProfile.fetch(buyerProfilePda);

      assert.equal(sellerProfile.totalTrades.toNumber(), 1);
      assert.equal(sellerProfile.successfulTrades.toNumber(), 1);
      assert.equal(buyerProfile.totalTrades.toNumber(), 1);
      assert.equal(buyerProfile.successfulTrades.toNumber(), 1);

      console.log("✅ Fondos liberados - Buyer recibió:", buyerAmount / LAMPORTS_PER_SOL, "SOL");
      console.log("✅ Comisión de plataforma:", fee / LAMPORTS_PER_SOL, "SOL");
    });
  });

  describe("4. Flujo Completo P2P con USDC", () => {
    const amount = new BN(100 * 1_000_000); // 100 USDC
    const amountMxn = new BN(2_000_000_000); // 2,000 MXN

    before(async () => {
      // Create escrow token account
      escrowTokenAccount = await createAccount(
        provider.connection,
        authority.payer,
        usdcMint,
        escrowPda2,
        null,
        undefined,
        TOKEN_PROGRAM_ID
      );
    });

    it("Debe crear orden de venta de USDC", async () => {
      await program.methods
        .createOrder(
          orderId2,
          amount,
          amountMxn,
          { usdc: {} },
          { stp: {} },
          "STP_REF_002"
        )
        .accounts({
          order: orderPda2,
          escrow: escrowPda2,
          sellerProfile: sellerProfilePda,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const order = await program.account.order.fetch(orderPda2);
      assert.equal(order.orderId, orderId2);

      console.log("✅ Orden USDC creada:", orderId2);
    });

    it("Buyer debe aceptar orden USDC", async () => {
      await program.methods
        .acceptOrder()
        .accounts({
          order: orderPda2,
          buyerProfile: buyerProfilePda,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();

      console.log("✅ Orden USDC aceptada");
    });

    it("Seller debe depositar USDC en escrow", async () => {
      await program.methods
        .depositToEscrowSpl()
        .accounts({
          order: orderPda2,
          escrow: escrowPda2,
          sellerTokenAccount: sellerTokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          seller: seller.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([seller])
        .rpc();

      const escrowAccount = await getAccount(provider.connection, escrowTokenAccount);
      assert.equal(escrowAccount.amount.toString(), amount.toString());

      console.log("✅ USDC depositado en escrow:", amount.toNumber() / 1_000_000);
    });

    it("Buyer confirma pago y se liberan fondos USDC", async () => {
      await program.methods
        .confirmFiatPayment("STP_TX_87654321")
        .accounts({
          order: orderPda2,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();

      await program.methods
        .updateOracleStatus(true)
        .accounts({
          order: orderPda2,
          platform: platformPda,
          oracle: authority.publicKey,
        })
        .rpc();

      const buyerBalanceBefore = await getAccount(provider.connection, buyerTokenAccount);

      await program.methods
        .releaseFundsSpl()
        .accounts({
          order: orderPda2,
          escrow: escrowPda2,
          platform: platformPda,
          escrowTokenAccount: escrowTokenAccount,
          buyerTokenAccount: buyerTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          sellerProfile: sellerProfilePda,
          buyerProfile: buyerProfilePda,
          authority: authority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const buyerBalanceAfter = await getAccount(provider.connection, buyerTokenAccount);
      const treasuryBalance = await getAccount(provider.connection, treasuryTokenAccount);

      const fee = amount.toNumber() * 50 / 10000;
      const buyerAmount = amount.toNumber() - fee;

      assert.equal(
        Number(buyerBalanceAfter.amount) - Number(buyerBalanceBefore.amount),
        buyerAmount
      );
      assert.equal(Number(treasuryBalance.amount), fee);

      console.log("✅ USDC liberado - Buyer recibió:", buyerAmount / 1_000_000, "USDC");
      console.log("✅ Comisión:", fee / 1_000_000, "USDC");
    });
  });

  describe("5. Sistema de Disputas", () => {
    const orderId = "ORDER_003_DISPUTE";
    let orderPda: PublicKey;
    let escrowPda: PublicKey;
    let disputePda: PublicKey;
    const amount = new BN(1 * LAMPORTS_PER_SOL);

    before(async () => {
      [orderPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("order"), Buffer.from(orderId)],
        program.programId
      );

      [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      );

      [disputePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("dispute"), orderPda.toBuffer()],
        program.programId
      );

      // Crear y fondear orden
      await program.methods
        .createOrder(
          orderId,
          amount,
          new BN(2_000_000_000),
          { sol: {} },
          { stp: {} },
          "STP_REF_003"
        )
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          sellerProfile: sellerProfilePda,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      await program.methods
        .acceptOrder()
        .accounts({
          order: orderPda,
          buyerProfile: buyerProfilePda,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();

      await program.methods
        .depositToEscrowNative()
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();
    });

    it("Debe abrir una disputa", async () => {
      await program.methods
        .openDispute(
          "Buyer no recibió el pago fiat",
          "https://evidence.com/proof123"
        )
        .accounts({
          dispute: disputePda,
          order: orderPda,
          sellerProfile: sellerProfilePda,
          buyerProfile: buyerProfilePda,
          initiator: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const dispute = await program.account.dispute.fetch(disputePda);
      const order = await program.account.order.fetch(orderPda);

      assert.equal(dispute.initiator.toString(), seller.publicKey.toString());
      assert.equal(dispute.reason, "Buyer no recibió el pago fiat");
      assert.deepEqual(order.status, { disputed: {} });

      console.log("✅ Disputa abierta");
    });

    it("Debe resolver disputa con split 50/50", async () => {
      const sellerBalanceBefore = await provider.connection.getBalance(seller.publicKey);
      const buyerBalanceBefore = await provider.connection.getBalance(buyer.publicKey);

      await program.methods
        .resolveDisputeSplitNative()
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          platform: platformPda,
          seller: seller.publicKey,
          buyer: buyer.publicKey,
          treasury: treasury.publicKey,
          resolver: authority.publicKey,
        })
        .rpc();

      const order = await program.account.order.fetch(orderPda);
      const sellerBalanceAfter = await provider.connection.getBalance(seller.publicKey);
      const buyerBalanceAfter = await provider.connection.getBalance(buyer.publicKey);

      assert.deepEqual(order.status, { partialRefund: {} });

      const fee = amount.toNumber() * 50 / 10000;
      const remaining = amount.toNumber() - fee;
      const halfAmount = Math.floor(remaining / 2);

      assert.approximately(
        sellerBalanceAfter - sellerBalanceBefore,
        halfAmount,
        1000
      );
      assert.approximately(
        buyerBalanceAfter - buyerBalanceBefore,
        halfAmount,
        1000
      );

      console.log("✅ Disputa resuelta con split 50/50");
      console.log("   Seller recibió:", halfAmount / LAMPORTS_PER_SOL, "SOL");
      console.log("   Buyer recibió:", halfAmount / LAMPORTS_PER_SOL, "SOL");
    });
  });

  describe("6. Cancelación de Órdenes", () => {
    const orderId = "ORDER_004_CANCEL";
    let orderPda: PublicKey;
    let escrowPda: PublicKey;
    const amount = new BN(0.3 * LAMPORTS_PER_SOL);

    before(async () => {
      [orderPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("order"), Buffer.from(orderId)],
        program.programId
      );

      [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      );

      await program.methods
        .createOrder(
          orderId,
          amount,
          new BN(1_000_000_000),
          { sol: {} },
          { stp: {} },
          "STP_REF_004"
        )
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          sellerProfile: sellerProfilePda,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      await program.methods
        .acceptOrder()
        .accounts({
          order: orderPda,
          buyerProfile: buyerProfilePda,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();

      await program.methods
        .depositToEscrowNative()
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          seller: seller.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([seller])
        .rpc();
    });

    it("Seller debe poder cancelar orden y recuperar fondos", async () => {
      const sellerBalanceBefore = await provider.connection.getBalance(seller.publicKey);

      await program.methods
        .cancelOrderNative()
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      const order = await program.account.order.fetch(orderPda);
      const sellerBalanceAfter = await provider.connection.getBalance(seller.publicKey);

      assert.deepEqual(order.status, { cancelled: {} });
      assert.approximately(
        sellerBalanceAfter - sellerBalanceBefore,
        amount.toNumber(),
        10000 // Mayor margen por fees de tx
      );

      console.log("✅ Orden cancelada y fondos devueltos al seller");
    });
  });

  describe("7. Validaciones y Límites", () => {
    it("Debe rechazar orden que excede límite de 9,000 MXN", async () => {
      const orderId = "ORDER_OVERLIMIT";
      const [orderPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("order"), Buffer.from(orderId)],
        program.programId
      );

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createOrder(
            orderId,
            new BN(1 * LAMPORTS_PER_SOL),
            new BN(10_000_000_000), // 10,000 MXN (excede límite)
            { sol: {} },
            { stp: {} },
            "STP_REF_LIMIT"
          )
          .accounts({
            order: orderPda,
            escrow: escrowPda,
            sellerProfile: sellerProfilePda,
            seller: seller.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([seller])
          .rpc();

        assert.fail("Debería haber fallado por exceder límite");
      } catch (error) {
        assert.include(error.toString(), "ExceedsMaxLimit");
        console.log("✅ Límite de 9,000 MXN validado correctamente");
      }
    });

    it("Debe rechazar usuario sin KYC", async () => {
      const noKycUser = Keypair.generate();

      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          noKycUser.publicKey,
          2 * LAMPORTS_PER_SOL
        )
      );

      const [noKycProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), noKycUser.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createUserProfile(false, null) // Sin KYC
        .accounts({
          userProfile: noKycProfilePda,
          user: noKycUser.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([noKycUser])
        .rpc();

      const orderId = "ORDER_NO_KYC";
      const [orderPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("order"), Buffer.from(orderId)],
        program.programId
      );

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createOrder(
            orderId,
            new BN(0.1 * LAMPORTS_PER_SOL),
            new BN(1_000_000_000),
            { sol: {} },
            { stp: {} },
            "STP_REF_NOKYC"
          )
          .accounts({
            order: orderPda,
            escrow: escrowPda,
            sellerProfile: noKycProfilePda,
            seller: noKycUser.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([noKycUser])
          .rpc();

        assert.fail("Debería haber fallado por falta de KYC");
      } catch (error) {
        assert.include(error.toString(), "KYCRequired");
        console.log("✅ Validación KYC funcionando correctamente");
      }
    });
  });

  console.log("\n🎉 Todos los tests completados exitosamente!");
});
