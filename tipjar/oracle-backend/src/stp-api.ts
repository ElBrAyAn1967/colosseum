import axios, { AxiosInstance } from 'axios';
import config from './config';

/**
 * Cliente para interactuar con la API de STP
 * NOTA: Esta es una implementación SIMULADA.
 * Cuando tengas acceso a la API real de STP, reemplaza los métodos con llamadas reales.
 */

export interface StpPaymentVerification {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'error';
  amount: number;
  currency: 'MXN';
  sender: {
    account: string;
    name: string;
    bank: string;
  };
  receiver: {
    account: string;
    name: string;
    bank: string;
  };
  reference: string;
  timestamp: Date;
  confirmations: number;
}

export class StpApiClient {
  private client: AxiosInstance;
  private simulationMode: boolean;

  constructor() {
    this.client = axios.create({
      baseURL: config.stp.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.stp.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Activar modo simulación si estamos en desarrollo
    this.simulationMode = config.server.nodeEnv === 'development' ||
                          config.stp.apiKey === 'SIMULATED_API_KEY';

    if (this.simulationMode) {
      console.log('⚠️  STP API en modo SIMULACIÓN - Para producción, configura las credenciales reales');
    }
  }

  /**
   * Verificar un pago en el sistema STP
   *
   * SIMULACIÓN: Retorna datos mock
   * PRODUCCIÓN: Debes implementar la llamada real a la API de STP
   *
   * Endpoint real de STP (ejemplo):
   * GET /ordenes/ordenPago/{transactionId}
   *
   * Documentación: https://stpmex.zendesk.com/hc/es/articles/360038242071
   */
  async verifyPayment(transactionId: string): Promise<StpPaymentVerification> {
    if (this.simulationMode) {
      return this.simulatePaymentVerification(transactionId);
    }

    try {
      // IMPLEMENTACIÓN REAL (comentada hasta tener API real)
      /*
      const response = await this.client.get(`/ordenes/ordenPago/${transactionId}`);

      return {
        transactionId: response.data.id,
        status: this.mapStpStatus(response.data.estado),
        amount: parseFloat(response.data.monto),
        currency: 'MXN',
        sender: {
          account: response.data.cuentaOrdenante,
          name: response.data.nombreOrdenante,
          bank: response.data.institucionOperante,
        },
        receiver: {
          account: response.data.cuentaBeneficiario,
          name: response.data.nombreBeneficiario,
          bank: response.data.institucionContraparte,
        },
        reference: response.data.referenciaNumerica,
        timestamp: new Date(response.data.fechaOperacion),
        confirmations: response.data.estado === 'LIQUIDADA' ? 1 : 0,
      };
      */

      throw new Error('API real de STP no configurada. Ejecutando en modo simulación.');
    } catch (error) {
      console.error('Error al verificar pago en STP:', error);
      throw error;
    }
  }

  /**
   * Consultar estado de una referencia STP
   *
   * PRODUCCIÓN: Implementar llamada real
   * GET /ordenes/consultaPorReferencia/{reference}
   */
  async getPaymentByReference(reference: string): Promise<StpPaymentVerification | null> {
    if (this.simulationMode) {
      return this.simulatePaymentByReference(reference);
    }

    try {
      // IMPLEMENTACIÓN REAL (comentada)
      /*
      const response = await this.client.get(`/ordenes/consultaPorReferencia/${reference}`);

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const payment = response.data[0];
      return this.mapPaymentData(payment);
      */

      throw new Error('API real de STP no configurada');
    } catch (error) {
      console.error('Error al consultar por referencia:', error);
      return null;
    }
  }

  /**
   * Webhook handler para notificaciones de STP
   * STP puede enviar notificaciones cuando un pago es procesado
   */
  async handleWebhook(payload: any): Promise<StpPaymentVerification> {
    if (this.simulationMode) {
      console.log('📨 Webhook simulado recibido:', payload);
      return this.simulatePaymentVerification(payload.transactionId);
    }

    // Validar firma del webhook (implementar según docs de STP)
    // this.validateWebhookSignature(payload);

    return this.mapPaymentData(payload);
  }

  // ========================================================================
  // MÉTODOS DE SIMULACIÓN (Remover en producción)
  // ========================================================================

  private simulatePaymentVerification(transactionId: string): StpPaymentVerification {
    // Simular diferentes estados basados en el ID
    const lastChar = transactionId.slice(-1);
    let status: 'pending' | 'confirmed' | 'rejected' | 'error';

    if (lastChar >= '0' && lastChar <= '7') {
      status = 'confirmed'; // 80% de probabilidad de éxito
    } else if (lastChar === '8') {
      status = 'pending';
    } else {
      status = 'rejected';
    }

    console.log(`🔍 SIMULACIÓN: Verificando pago ${transactionId} -> ${status}`);

    return {
      transactionId,
      status,
      amount: 2000 + Math.random() * 7000, // Entre 2000 y 9000 MXN
      currency: 'MXN',
      sender: {
        account: '012180001234567890',
        name: 'Juan Pérez',
        bank: 'BBVA',
      },
      receiver: {
        account: '002180009876543210',
        name: 'María González',
        bank: 'BANORTE',
      },
      reference: `STP_REF_${transactionId}`,
      timestamp: new Date(),
      confirmations: status === 'confirmed' ? 1 : 0,
    };
  }

  private simulatePaymentByReference(reference: string): StpPaymentVerification | null {
    if (!reference.startsWith('STP_REF_')) {
      return null;
    }

    const txId = reference.replace('STP_REF_', '');
    return this.simulatePaymentVerification(txId);
  }

  private mapPaymentData(data: any): StpPaymentVerification {
    // Mapear datos reales de STP a nuestro formato
    return {
      transactionId: data.id || data.transactionId,
      status: this.mapStpStatus(data.estado || data.status),
      amount: parseFloat(data.monto || data.amount),
      currency: 'MXN',
      sender: {
        account: data.cuentaOrdenante || data.senderAccount,
        name: data.nombreOrdenante || data.senderName,
        bank: data.institucionOperante || data.senderBank,
      },
      receiver: {
        account: data.cuentaBeneficiario || data.receiverAccount,
        name: data.nombreBeneficiario || data.receiverName,
        bank: data.institucionContraparte || data.receiverBank,
      },
      reference: data.referenciaNumerica || data.reference,
      timestamp: new Date(data.fechaOperacion || data.timestamp),
      confirmations: data.estado === 'LIQUIDADA' ? 1 : 0,
    };
  }

  private mapStpStatus(stpStatus: string): 'pending' | 'confirmed' | 'rejected' | 'error' {
    const statusMap: Record<string, 'pending' | 'confirmed' | 'rejected' | 'error'> = {
      'LIQUIDADA': 'confirmed',
      'AUTORIZADA': 'confirmed',
      'EN_PROCESO': 'pending',
      'PENDIENTE': 'pending',
      'RECHAZADA': 'rejected',
      'CANCELADA': 'rejected',
      'ERROR': 'error',
    };

    return statusMap[stpStatus] || 'pending';
  }
}

export default new StpApiClient();
