import PropTypes from 'prop-types';

/**
 * Badge component for status indicators
 */
export default function Badge({
  children,
  variant = 'primary',
  status = null,
  className = '',
}) {
  // If status is provided, use status badge classes
  if (status) {
    const statusClass = `badge-status-${status.toLowerCase().replace(/ /g, '-')}`;
    return (
      <span className={`${statusClass} ${className}`}>
        {children}
      </span>
    );
  }

  // Otherwise use variant badge classes
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  status: PropTypes.oneOf([
    'open',
    'accepted',
    'funded',
    'payment-confirmed',
    'completed',
    'cancelled',
    'disputed',
    null
  ]),
  className: PropTypes.string,
};
