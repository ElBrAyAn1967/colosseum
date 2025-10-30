import PropTypes from 'prop-types';
import { useCivicPass } from '../../hooks/useCivicPass';
import { CIVIC_PASS_STATUS } from '../../services/civicKyc';
import Button from './Button';
import Spinner from './Spinner';

/**
 * KYC Badge Component
 * Shows Civic Pass verification status and allows users to start verification
 */
export default function KycBadge({ showVerifyButton = false, className = '' }) {
  const {
    loading,
    hasPass,
    status,
    isValid,
    statusMessage,
    isVerifying,
    startVerification,
  } = useCivicPass();

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${className}`}>
        <Spinner size="sm" />
        <span>Checking KYC...</span>
      </div>
    );
  }

  // Get badge color based on status
  const getBadgeColor = () => {
    if (!hasPass) return 'bg-gray-500';

    switch (status) {
      case CIVIC_PASS_STATUS.ACTIVE:
        return 'bg-green-500';
      case CIVIC_PASS_STATUS.FROZEN:
        return 'bg-yellow-500';
      case CIVIC_PASS_STATUS.REVOKED:
        return 'bg-red-500';
      case CIVIC_PASS_STATUS.REQUESTED:
        return 'bg-blue-500';
      case CIVIC_PASS_STATUS.IN_REVIEW:
        return 'bg-orange-500';
      case CIVIC_PASS_STATUS.REJECTED:
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  // Get icon based on status
  const getIcon = () => {
    if (!hasPass) return '❌';

    switch (status) {
      case CIVIC_PASS_STATUS.ACTIVE:
        return '✓';
      case CIVIC_PASS_STATUS.FROZEN:
        return '❄️';
      case CIVIC_PASS_STATUS.REVOKED:
        return '🚫';
      case CIVIC_PASS_STATUS.REQUESTED:
        return '⏳';
      case CIVIC_PASS_STATUS.IN_REVIEW:
        return '🔍';
      case CIVIC_PASS_STATUS.REJECTED:
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${getBadgeColor()}`}
        title={statusMessage}
      >
        <span>{getIcon()}</span>
        <span>{statusMessage}</span>
      </div>

      {showVerifyButton && !isValid && (
        <Button
          onClick={startVerification}
          disabled={isVerifying}
          variant="primary"
          size="sm"
        >
          {isVerifying ? (
            <>
              <Spinner size="sm" />
              <span>Verifying...</span>
            </>
          ) : (
            'Start Verification'
          )}
        </Button>
      )}
    </div>
  );
}

KycBadge.propTypes = {
  showVerifyButton: PropTypes.bool,
  className: PropTypes.string,
};
