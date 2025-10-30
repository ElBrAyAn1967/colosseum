import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';

/**
 * Hook to manage user profile operations
 */
export function useUserProfile() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  useEffect(() => {
    if (!program || !publicKey) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [profilePda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_profile'), publicKey.toBuffer()],
          program.programId
        );

        const profileAccount = await program.account.userProfile.fetch(profilePda);
        setProfile(profileAccount);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [program, publicKey]);

  // Create user profile
  const createProfile = async (kycVerified = false, kycNftMint = null) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    try {
      setLoading(true);
      const tx = await program.methods
        .createUserProfile(kycVerified, kycNftMint)
        .accounts({
          user: publicKey,
        })
        .rpc();

      console.log('Profile created:', tx);
      // Refresh profile
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), publicKey.toBuffer()],
        program.programId
      );
      const profileAccount = await program.account.userProfile.fetch(profilePda);
      setProfile(profileAccount);

      return tx;
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    hasProfile: !!profile,
  };
}
