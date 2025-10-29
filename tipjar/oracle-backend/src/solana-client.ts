import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, web3 } from '@coral-xyz/anchor';
import config from './config';
import IDL from './idl.json';

/**
 * Cliente para interactuar con el programa de Solana
 */
export class SolanaClient {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program;

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');

    // Crear wallet desde el keypair del oráculo
    const wallet = new Wallet(config.oracle.keypair);

    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment: 'confirmed' }
    );

    // @ts-ignore - El IDL se genera después de compilar
    this.program = new Program(IDL, config.solana.programId, this.provider);

    console.log('✅ Solana client inicializado');
    console.log('   RPC:', config.solana.rpcUrl);
    console.log('   Oracle Pubkey:', wallet.publicKey.toString());
  }

  /**
   * Obtener la PDA de la plataforma
   */
  getPlatformPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      config.solana.programId
    );
  }

  /**
   * Obtener la PDA de una orden
   */
  getOrderPda(orderId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('order'), Buffer.from(orderId)],
      config.solana.programId
    );
  }

  /**
   * Obtener datos de una orden
   */
  async getOrder(orderId: string) {
    try {
      const [orderPda] = this.getOrderPda(orderId);
      const orderAccount = await this.program.account.order.fetch(orderPda);
      return orderAccount;
    } catch (error) {
      console.error(`Error al obtener orden ${orderId}:`, error);
      return null;
    }
  }

  /**
   * Actualizar el estado del oráculo para una orden
   */
  async updateOracleStatus(orderId: string, confirmed: boolean): Promise<string> {
    try {
      const [platformPda] = this.getPlatformPda();
      const [orderPda] = this.getOrderPda(orderId);

      console.log(`📝 Actualizando estado del oráculo para orden ${orderId}: ${confirmed}`);

      const tx = await this.program.methods
        .updateOracleStatus(confirmed)
        .accounts({
          order: orderPda,
          platform: platformPda,
          oracle: config.oracle.keypair.publicKey,
        })
        .rpc();

      console.log(`✅ Oráculo actualizado. TX: ${tx}`);
      return tx;
    } catch (error) {
      console.error('Error al actualizar oráculo:', error);
      throw error;
    }
  }

  /**
   * Liberar fondos de una orden (SOL)
   */
  async releaseFundsNative(orderId: string): Promise<string> {
    try {
      const [platformPda] = this.getPlatformPda();
      const [orderPda] = this.getOrderPda(orderId);
      const order = await this.getOrder(orderId);

      if (!order) {
        throw new Error('Orden no encontrada');
      }

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), orderPda.toBuffer()],
        config.solana.programId
      );

      const [sellerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), order.seller.toBuffer()],
        config.solana.programId
      );

      const [buyerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), order.buyer.toBuffer()],
        config.solana.programId
      );

      const platform = await this.program.account.platform.fetch(platformPda);

      console.log(`💰 Liberando fondos SOL para orden ${orderId}`);

      const tx = await this.program.methods
        .releaseFundsNative()
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          platform: platformPda,
          buyer: order.buyer,
          treasury: platform.treasury,
          sellerProfile: sellerProfilePda,
          buyerProfile: buyerProfilePda,
          authority: config.oracle.keypair.publicKey,
        })
        .rpc();

      console.log(`✅ Fondos liberados. TX: ${tx}`);
      return tx;
    } catch (error) {
      console.error('Error al liberar fondos:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las órdenes que necesitan verificación
   */
  async getOrdersPendingVerification(): Promise<any[]> {
    try {
      // Filtrar órdenes con status PaymentConfirmed y oráculo no confirmado
      const orders = await this.program.account.order.all([
        {
          memcmp: {
            offset: 8 + 50 + 32 + 33, // Aproximado, ajustar según layout
            bytes: '', // Filtro por status
          }
        }
      ]);

      return orders.filter((order: any) => {
        return order.account.stpTransactionId &&
               !order.account.stpOracleConfirmed &&
               order.account.status.paymentConfirmed;
      });
    } catch (error) {
      console.error('Error al obtener órdenes pendientes:', error);
      return [];
    }
  }
}

export default new SolanaClient();
