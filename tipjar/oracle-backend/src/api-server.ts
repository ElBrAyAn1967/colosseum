import express, { Request, Response } from 'express';
import config from './config';
import oracleService from './oracle-service';
import stpApiClient from './stp-api';

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    oracle: config.oracle.keypair.publicKey.toString(),
    network: config.solana.network,
  });
});

// Status del oráculo
app.get('/status', (req: Request, res: Response) => {
  res.json({
    running: true,
    pollingInterval: config.polling.intervalMs,
    stpApiMode: config.server.nodeEnv === 'development' ? 'simulation' : 'production',
    oraclePublicKey: config.oracle.keypair.publicKey.toString(),
  });
});

// Verificar manualmente una orden
app.post('/verify-order', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: 'orderId es requerido',
      });
    }

    const result = await oracleService.verifyOrderManually(orderId);

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Error al verificar orden',
    });
  }
});

// Verificar un pago STP directamente (para testing)
app.post('/verify-stp-payment', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        error: 'transactionId es requerido',
      });
    }

    const verification = await stpApiClient.verifyPayment(transactionId);

    return res.json({
      success: true,
      verification,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Error al verificar pago',
    });
  }
});

// Webhook endpoint para STP
app.post('/webhook/stp', async (req: Request, res: Response) => {
  try {
    // Validar secret (implementar en producción)
    const webhookSecret = req.headers['x-webhook-secret'];

    if (webhookSecret !== config.webhook.secret) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    await oracleService.handleStpWebhook(req.body);

    return res.json({
      success: true,
      message: 'Webhook procesado',
    });
  } catch (error: any) {
    console.error('Error en webhook:', error);
    return res.status(500).json({
      error: 'Error al procesar webhook',
    });
  }
});

// Simular recepción de pago (solo desarrollo)
app.post('/dev/simulate-payment', async (req: Request, res: Response) => {
  if (config.server.nodeEnv !== 'development') {
    return res.status(403).json({
      error: 'Solo disponible en desarrollo',
    });
  }

  try {
    const { orderId, stpTransactionId, status } = req.body;

    if (!orderId || !stpTransactionId) {
      return res.status(400).json({
        error: 'orderId y stpTransactionId son requeridos',
      });
    }

    // Simular procesamiento
    const result = await oracleService.processOrder(orderId, stpTransactionId);

    return res.json({
      success: result,
      message: 'Pago simulado procesado',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

export function startServer() {
  app.listen(config.server.port, () => {
    console.log(`🌐 API Server corriendo en puerto ${config.server.port}`);
    console.log(`   Health: http://localhost:${config.server.port}/health`);
    console.log(`   Status: http://localhost:${config.server.port}/status`);
  });
}

export default app;
