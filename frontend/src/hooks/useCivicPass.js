import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { checkCivicPass, CIVIC_PASS_STATUS } from '../services/civicKyc';

/**
 * Hook to manage Civic Pass KYC verification
 * @returns {object} Civic Pass status and methods
 */
export function useCivicPass() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [passStatus, setPassStatus] = useState({
    loading: true,
    hasPass: false,
    status: null,
    expiry: null,
    error: null,
  });

  const [isVerifying, setIsVerifying] = useState(false);

  // Check Civic Pass status when wallet connects
  useEffect(() => {
    async function checkPass() {
      if (!connected || !publicKey) {
        setPassStatus({
          loading: false,
          hasPass: false,
          status: null,
          expiry: null,
          error: null,
        });
        return;
      }

      try {
        setPassStatus((prev) => ({ ...prev, loading: true, error: null }));

        const result = await checkCivicPass(publicKey);

        setPassStatus({
          loading: false,
          hasPass: result.hasPass,
          status: result.status,
          expiry: result.expiry,
          error: null,
        });
      } catch (error) {
        console.error('Error checking Civic Pass:', error);
        setPassStatus({
          loading: false,
          hasPass: false,
          status: null,
          expiry: null,
          error: error.message,
        });
      }
    }

    checkPass();
  }, [publicKey, connected]);

  /**
   * Refresh Civic Pass status
   */
  const refreshStatus = async () => {
    if (!publicKey) return;

    try {
      setPassStatus((prev) => ({ ...prev, loading: true, error: null }));

      const result = await checkCivicPass(publicKey);

      setPassStatus({
        loading: false,
        hasPass: result.hasPass,
        status: result.status,
        expiry: result.expiry,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing Civic Pass:', error);
      setPassStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  /**
   * Start Civic Pass verification flow
   */
  const startVerification = async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setIsVerifying(true);
    try {
      // In production, this would open the Civic Pass modal
      // using @civic/solana-gateway-react GatewayProvider
      console.log('Starting Civic Pass verification...');

      // Simulate verification process (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh status after verification
      await refreshStatus();

      return { success: true };
    } catch (error) {
      console.error('Error starting verification:', error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Check if pass is valid for transactions
   */
  const isValidForTransaction = () => {
    if (!passStatus.hasPass) return false;
    if (passStatus.status !== CIVIC_PASS_STATUS.ACTIVE) return false;
    if (passStatus.expiry && passStatus.expiry < Date.now()) return false;

    return true;
  };

  /**
   * Get human-readable status message
   */
  const getStatusMessage = () => {
    if (passStatus.loading) return 'Checking verification status...';
    if (passStatus.error) return `Error: ${passStatus.error}`;
    if (!connected) return 'Please connect your wallet';
    if (!passStatus.hasPass) return 'KYC verification required';

    switch (passStatus.status) {
      case CIVIC_PASS_STATUS.ACTIVE:
        return 'Verification active';
      case CIVIC_PASS_STATUS.FROZEN:
        return 'Verification frozen';
      case CIVIC_PASS_STATUS.REVOKED:
        return 'Verification revoked';
      case CIVIC_PASS_STATUS.REQUESTED:
        return 'Verification requested';
      case CIVIC_PASS_STATUS.IN_REVIEW:
        return 'Verification in review';
      case CIVIC_PASS_STATUS.REJECTED:
        return 'Verification rejected';
      default:
        return 'Unknown status';
    }
  };

  return {
    // Status
    loading: passStatus.loading,
    hasPass: passStatus.hasPass,
    status: passStatus.status,
    expiry: passStatus.expiry,
    error: passStatus.error,
    isVerifying,

    // Computed
    isValid: isValidForTransaction(),
    statusMessage: getStatusMessage(),

    // Methods
    refreshStatus,
    startVerification,
  };
}
