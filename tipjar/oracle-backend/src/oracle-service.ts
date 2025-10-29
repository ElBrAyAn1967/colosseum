import stpApiClient, { StpPaymentVerification } from './stp-api';
import solanaClient from './solana-client';
import config from './config';

/**
 * Servicio principal del oráculo
 * Coordina la verificación de pagos STP y la actualización en Solana
 */
export class OracleService {
  private isRunning: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    console.log('🔮 Oracle Service inicializado');
  }

  /**
   * Iniciar el servicio de polling
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Oracle ya está corriendo');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Iniciando polling cada ${config.polling.intervalMs}ms`);

    // Ejecutar inmediatamente
    this.checkPendingOrders();

    // Configurar polling
    this.pollingInterval = setInterval(
      () => this.checkPendingOrders(),
      config.polling.intervalMs
    );
  }

  /**
   * Detener el servicio
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Oracle detenido');
  }

  /**
   * Verificar órdenes pendientes de confirmación
   */
  private async checkPendingOrders() {
    try {
      console.log('🔍 Verificando órdenes pendientes...');

      const pendingOrders = await solanaClient.getOrdersPendingVerification();

      if (pendingOrders.length === 0) {
        console.log('   No hay órdenes pendientes');
        return;
      }

      console.log(`   Encontradas ${pendingOrders.length} órdenes para verificar`);

      for (const orderAccount of pendingOrders) {
        const order = orderAccount.account;
        await this.processOrder(order.orderId, order.stpTransactionId);
      }
    } catch (error) {
      console.error('❌ Error en polling:', error);
    }
  }

  /**
   * Procesar una orden individual
   */
  async processOrder(orderId: string, stpTransactionId: string): Promise<boolean> {
    try {
      console.log(`\n📋 Procesando orden: ${orderId}`);
      console.log(`   STP TX ID: ${stpTransactionId}`);

      // 1. Verificar el pago en STP
      const verification = await stpApiClient.verifyPayment(stpTransactionId);

      console.log(`   Estado STP: ${verification.status}`);
      console.log(`   Monto: ${verification.amount} ${verification.currency}`);

      // 2. Determinar si confirmar o rechazar
      let confirmed = false;

      switch (verification.status) {
        case 'confirmed':
          confirmed = true;
          console.log('   ✅ Pago confirmado en STP');
          break;

        case 'rejected':
        case 'error':
          confirmed = false;
          console.log('   ❌ Pago rechazado en STP');
          break;

        case 'pending':
          console.log('   ⏳ Pago aún pendiente en STP, esperando...');
          return false; // No actualizar todavía
      }

      // 3. Actualizar el estado en Solana
      await solanaClient.updateOracleStatus(orderId, confirmed);

      // 4. Si está confirmado, liberar fondos
      if (confirmed) {
        const order = await solanaClient.getOrder(orderId);

        if (order && order.tokenType.sol) {
          console.log('   💰 Liberando fondos SOL...');
          await solanaClient.releaseFundsNative(orderId);
        } else if (order) {
          console.log('   💰 Liberando fondos SPL...');
          // Implementar release SPL si es necesario
          // await solanaClient.releaseFundsSpl(orderId);
        }
      }

      console.log(`   ✅ Orden ${orderId} procesada exitosamente\n`);
      return true;
    } catch (error) {
      console.error(`   ❌ Error al procesar orden ${orderId}:`, error);
      return false;
    }
  }

  /**
   * Verificar manualmente una orden (para llamadas API)
   */
  async verifyOrderManually(orderId: string): Promise<{
    success: boolean;
    message: string;
    verification?: StpPaymentVerification;
  }> {
    try {
      const order = await solanaClient.getOrder(orderId);

      if (!order) {
        return {
          success: false,
          message: 'Orden no encontrada',
        };
      }

      if (!order.stpTransactionId) {
        return {
          success: false,
          message: 'Orden no tiene ID de transacción STP',
        };
      }

      if (order.stpOracleConfirmed) {
        return {
          success: false,
          message: 'Orden ya fue confirmada por el oráculo',
        };
      }

      const verification = await stpApiClient.verifyPayment(order.stpTransactionId);

      if (verification.status !== 'confirmed') {
        return {
          success: false,
          message: `Pago en estado: ${verification.status}`,
          verification,
        };
      }

      await this.processOrder(orderId, order.stpTransactionId);

      return {
        success: true,
        message: 'Orden verificada y procesada',
        verification,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al verificar orden',
      };
    }
  }

  /**
   * Handler para webhooks de STP
   */
  async handleStpWebhook(payload: any): Promise<void> {
    try {
      console.log('📨 Webhook recibido de STP');

      const verification = await stpApiClient.handleWebhook(payload);

      // Buscar orden por referencia STP
      const order = await this.findOrderByStpReference(verification.reference);

      if (!order) {
        console.log('⚠️  No se encontró orden para la referencia:', verification.reference);
        return;
      }

      await this.processOrder(order.orderId, verification.transactionId);
    } catch (error) {
      console.error('❌ Error al procesar webhook:', error);
    }
  }

  /**
   * Buscar orden por referencia STP
   */
  private async findOrderByStpReference(reference: string): Promise<any | null> {
    try {
      // Implementar búsqueda en el programa
      // Por ahora, retorna null
      return null;
    } catch (error) {
      console.error('Error al buscar orden por referencia:', error);
      return null;
    }
  }
}

export default new OracleService();
