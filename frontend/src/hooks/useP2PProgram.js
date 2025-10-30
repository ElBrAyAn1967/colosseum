import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from '../utils/constants';
import TipJarIDL from '../idl/tipjar.json';

/**
 * Main hook to interact with the TipJar P2P Solana program
 * Provides access to the Anchor program instance and provider
 */
export function useP2PProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;

    return new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;

    return new Program(TipJarIDL, PROGRAM_ID, provider);
  }, [provider]);

  /**
   * Get Platform PDA (Program Derived Address)
   */
  const getPlatformPDA = () => {
    const [platformPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      PROGRAM_ID
    );
    return platformPDA;
  };

  /**
   * Get User Profile PDA for a given wallet
   */
  const getUserProfilePDA = (userPublicKey) => {
    const [userProfilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), userPublicKey.toBuffer()],
      PROGRAM_ID
    );
    return userProfilePDA;
  };

  /**
   * Get Order PDA for a given order ID
   */
  const getOrderPDA = (orderId) => {
    const [orderPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('order'), Buffer.from(orderId)],
      PROGRAM_ID
    );
    return orderPDA;
  };

  /**
   * Get Escrow PDA for a given order PDA
   */
  const getEscrowPDA = (orderPDA) => {
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderPDA.toBuffer()],
      PROGRAM_ID
    );
    return escrowPDA;
  };

  /**
   * Get Dispute PDA for a given order PDA
   */
  const getDisputePDA = (orderPDA) => {
    const [disputePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('dispute'), orderPDA.toBuffer()],
      PROGRAM_ID
    );
    return disputePDA;
  };

  /**
   * Fetch Platform account data
   */
  const fetchPlatform = async () => {
    if (!program) return null;

    try {
      const platformPDA = getPlatformPDA();
      const platformAccount = await program.account.platform.fetch(platformPDA);
      return {
        publicKey: platformPDA,
        ...platformAccount,
      };
    } catch (error) {
      console.error('Error fetching platform:', error);
      return null;
    }
  };

  /**
   * Fetch User Profile for a wallet
   */
  const fetchUserProfile = async (userPublicKey) => {
    if (!program) return null;

    try {
      const userProfilePDA = getUserProfilePDA(userPublicKey);
      const userProfile = await program.account.userProfile.fetch(userProfilePDA);
      return {
        publicKey: userProfilePDA,
        ...userProfile,
      };
    } catch (error) {
      // User profile might not exist yet
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  /**
   * Fetch Order by PDA or ID
   */
  const fetchOrder = async (orderPDAorID) => {
    if (!program) return null;

    try {
      let orderPDA;
      if (typeof orderPDAorID === 'string') {
        orderPDA = getOrderPDA(orderPDAorID);
      } else {
        orderPDA = orderPDAorID;
      }

      const order = await program.account.order.fetch(orderPDA);
      return {
        publicKey: orderPDA,
        ...order,
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  };

  /**
   * Fetch all open orders
   */
  const fetchAllOrders = async () => {
    if (!program) return [];

    try {
      const orders = await program.account.order.all();
      return orders.map(order => ({
        publicKey: order.publicKey,
        ...order.account,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  /**
   * Fetch orders by status
   */
  const fetchOrdersByStatus = async (status) => {
    if (!program) return [];

    try {
      const orders = await program.account.order.all([
        {
          memcmp: {
            offset: 8 + 32 + 32 + 8 + 8 + 1 + 1, // Approximate offset for status field
            bytes: status, // This needs proper encoding based on Anchor's enum representation
          },
        },
      ]);
      return orders.map(order => ({
        publicKey: order.publicKey,
        ...order.account,
      }));
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  };

  /**
   * Fetch Dispute for an order
   */
  const fetchDispute = async (orderPDA) => {
    if (!program) return null;

    try {
      const disputePDA = getDisputePDA(orderPDA);
      const dispute = await program.account.dispute.fetch(disputePDA);
      return {
        publicKey: disputePDA,
        ...dispute,
      };
    } catch (error) {
      console.error('Error fetching dispute:', error);
      return null;
    }
  };

  return {
    program,
    provider,
    programId: PROGRAM_ID,

    // PDA helpers
    getPlatformPDA,
    getUserProfilePDA,
    getOrderPDA,
    getEscrowPDA,
    getDisputePDA,

    // Fetch functions
    fetchPlatform,
    fetchUserProfile,
    fetchOrder,
    fetchAllOrders,
    fetchOrdersByStatus,
    fetchDispute,

    // Wallet info
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}
