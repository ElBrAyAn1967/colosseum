import oracleService from './oracle-service';
import { startServer } from './api-server';
import config from './config';

console.log('='.repeat(60));
console.log('🔮 STP Oracle Backend');
console.log('='.repeat(60));
console.log('Network:', config.solana.network);
console.log('Oracle Pubkey:', config.oracle.keypair.publicKey.toString());
console.log('Program ID:', config.solana.programId.toString());
console.log('Mode:', config.server.nodeEnv);
console.log('='.repeat(60));

// Iniciar servicio del oráculo
oracleService.start();

// Iniciar API server
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando oráculo...');
  oracleService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando oráculo...');
  oracleService.stop();
  process.exit(0);
});
