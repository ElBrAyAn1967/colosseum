import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useMemo } from 'react';

// IMPORTANTE: Reemplazar con tu Program ID después del deploy
const PROGRAM_ID = new PublicKey('4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun');

// IDL temporal - se actualizará después de compilar
const IDL = {
  version: "0.1.0",
  name: "tipjar",
  instructions: [],
  accounts: [],
  types: [],
};

export function useP2PProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;

    return new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    try {
      return new Program(IDL, PROGRAM_ID, provider);
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  }, [provider]);

  // PDAs
  const getPlatformPda = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      PROGRAM_ID
    );
  };

  const getUserProfilePda = (userPubkey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), userPubkey.toBuffer()],
      PROGRAM_ID
    );
  };

  const getOrderPda = (orderId) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('order'), Buffer.from(orderId)],
      PROGRAM_ID
    );
  };

  const getEscrowPda = (orderPda) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderPda.toBuffer()],
      PROGRAM_ID
    );
  };

  const getDisputePda = (orderPda) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('dispute'), orderPda.toBuffer()],
      PROGRAM_ID
    );
  };

  // Métodos del programa
  const createUserProfile = async (kycVerified, kycNftMint = null) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [userProfilePda] = getUserProfilePda(wallet.publicKey);

    const tx = await program.methods
      .createUserProfile(kycVerified, kycNftMint)
      .accounts({
        userProfile: userProfilePda,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const createOrder = async (
    orderId,
    amount,
    amountMxn,
    tokenType,
    paymentMethod,
    stpReference
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

  const acceptOrder = async (orderPda) => {
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

  const depositToEscrowNative = async (orderPda) => {
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

  const confirmFiatPayment = async (orderPda, stpTransactionId) => {
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

  const openDispute = async (orderPda, reason, evidence) => {
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

  const cancelOrderNative = async (orderPda) => {
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
  const fetchOrder = async (orderPda) => {
    if (!program) throw new Error('Program not initialized');
    try {
      return await program.account.order.fetch(orderPda);
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  };

  const fetchUserProfile = async (userPubkey) => {
    if (!program) throw new Error('Program not initialized');
    const [userProfilePda] = getUserProfilePda(userPubkey);
    try {
      return await program.account.userProfile.fetch(userProfilePda);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const fetchAllOrders = async () => {
    if (!program) throw new Error('Program not initialized');
    try {
      return await program.account.order.all();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  const fetchOpenOrders = async () => {
    if (!program) throw new Error('Program not initialized');
    try {
      const orders = await program.account.order.all();
      return orders.filter((order) => order.account.status.open);
    } catch (error) {
      console.error('Error fetching open orders:', error);
      return [];
    }
  };

  const checkUserProfile = async () => {
    if (!wallet.publicKey || !program) return null;
    return await fetchUserProfile(wallet.publicKey);
  };

  return {
    program,
    connected: !!wallet.publicKey && !!program,
    publicKey: wallet.publicKey,
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
    checkUserProfile,
  };
}
