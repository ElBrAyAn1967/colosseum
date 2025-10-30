import PropTypes from 'prop-types';

/**
 * Alert component for notifications
 */
export default function Alert({
  children,
  variant = 'info',
  onClose,
  className = '',
}) {
  const variantClasses = {
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
    info: 'alert-info',
  };

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className={`${variantClasses[variant]} flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[variant]}</span>
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  onClose: PropTypes.func,
  className: PropTypes.string,
};
