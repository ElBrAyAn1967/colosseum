import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from '../idl.json';
import { PROGRAM_ID } from '../utils/constants';

/**
 * Hook to get the Anchor program instance
 */
export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    return new Program(idl, PROGRAM_ID, provider);
  }, [connection, wallet]);

  return program;
}
