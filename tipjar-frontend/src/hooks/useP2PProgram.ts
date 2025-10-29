import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useMemo } from 'react';
import IDL from '../idl/tipjar.json';

const PROGRAM_ID = new PublicKey('4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun');

export function useP2PProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;

    return new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    // @ts-ignore
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  // PDAs
  const getPlatformPda = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      PROGRAM_ID
    );
  };

  const getUserProfilePda = (userPubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), userPubkey.toBuffer()],
      PROGRAM_ID
    );
  };

  const getOrderPda = (orderId: string) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('order'), Buffer.from(orderId)],
      PROGRAM_ID
    );
  };

  const getEscrowPda = (orderPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderPda.toBuffer()],
      PROGRAM_ID
    );
  };

  const getDisputePda = (orderPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('dispute'), orderPda.toBuffer()],
      PROGRAM_ID
    );
  };

  // Métodos del programa
  const createUserProfile = async (kycVerified: boolean, kycNftMint?: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [userProfilePda] = getUserProfilePda(wallet.publicKey);

    const tx = await program.methods
      .createUserProfile(kycVerified, kycNftMint || null)
      .accounts({
        userProfile: userProfilePda,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const createOrder = async (
    orderId: string,
    amount: number,
    amountMxn: number,
    tokenType: 'SOL' | 'USDC' | 'USDT',
    paymentMethod: 'STP' | 'SPEI' | 'Cash',
    stpReference: string
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [orderPda] = getOrderPda(orderId);
    const [escrowPda] = getEscrowPda(orderPda);
    const [userProfilePda] = getUserProfilePda(wallet.publicKey);

    const tokenTypeEnum = { [tokenType.toLowerCase()]: {} };
    const paymentMethodEnum = { [paymentMethod.toLowerCase()]: {} };

    const tx = await program.methods
      .createOrder(
        orderId,
        new BN(amount),
        new BN(amountMxn),
        tokenTypeEnum,
        paymentMethodEnum,
        stpReference
      )
      .accounts({
        order: orderPda,
        escrow: escrowPda,
        sellerProfile: userProfilePda,
        seller: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { tx, orderPda, escrowPda };
  };

  const acceptOrder = async (orderPda: PublicKey, sellerPubkey: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [buyerProfilePda] = getUserProfilePda(wallet.publicKey);

    const tx = await program.methods
      .acceptOrder()
      .accounts({
        order: orderPda,
        buyerProfile: buyerProfilePda,
        buyer: wallet.publicKey,
      })
      .rpc();

    return tx;
  };

  const depositToEscrowNative = async (orderPda: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [escrowPda] = getEscrowPda(orderPda);

    const tx = await program.methods
      .depositToEscrowNative()
      .accounts({
        order: orderPda,
        escrow: escrowPda,
        seller: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const confirmFiatPayment = async (orderPda: PublicKey, stpTransactionId: string) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const tx = await program.methods
      .confirmFiatPayment(stpTransactionId)
      .accounts({
        order: orderPda,
        buyer: wallet.publicKey,
      })
      .rpc();

    return tx;
  };

  const openDispute = async (orderPda: PublicKey, reason: string, evidence: string) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const order = await program.account.order.fetch(orderPda);
    const [disputePda] = getDisputePda(orderPda);
    const [sellerProfilePda] = getUserProfilePda(order.seller);
    const [buyerProfilePda] = getUserProfilePda(order.buyer);

    const tx = await program.methods
      .openDispute(reason, evidence)
      .accounts({
        dispute: disputePda,
        order: orderPda,
        sellerProfile: sellerProfilePda,
        buyerProfile: buyerProfilePda,
        initiator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const cancelOrderNative = async (orderPda: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [escrowPda] = getEscrowPda(orderPda);

    const tx = await program.methods
      .cancelOrderNative()
      .accounts({
        order: orderPda,
        escrow: escrowPda,
        seller: wallet.publicKey,
      })
      .rpc();

    return tx;
  };

  // Fetch methods
  const fetchOrder = async (orderPda: PublicKey) => {
    if (!program) throw new Error('Program not initialized');
    return await program.account.order.fetch(orderPda);
  };

  const fetchUserProfile = async (userPubkey: PublicKey) => {
    if (!program) throw new Error('Program not initialized');
    const [userProfilePda] = getUserProfilePda(userPubkey);
    return await program.account.userProfile.fetch(userProfilePda);
  };

  const fetchAllOrders = async () => {
    if (!program) throw new Error('Program not initialized');
    return await program.account.order.all();
  };

  const fetchOpenOrders = async () => {
    if (!program) throw new Error('Program not initialized');
    const orders = await program.account.order.all();
    return orders.filter((order: any) => order.account.status.open);
  };

  return {
    program,
    // PDAs
    getPlatformPda,
    getUserProfilePda,
    getOrderPda,
    getEscrowPda,
    getDisputePda,
    // Methods
    createUserProfile,
    createOrder,
    acceptOrder,
    depositToEscrowNative,
    confirmFiatPayment,
    openDispute,
    cancelOrderNative,
    // Fetch
    fetchOrder,
    fetchUserProfile,
    fetchAllOrders,
    fetchOpenOrders,
  };
}
