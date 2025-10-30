import PropTypes from 'prop-types';

/**
 * Input component with label and error handling
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  className = '',
  ...props
}) {
  const inputClass = `
    input
    ${error ? 'input-error' : ''}
    ${success ? 'input-success' : ''}
    ${className}
  `.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && (
        <p className="label-error">{error}</p>
      )}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  success: PropTypes.bool,
  className: PropTypes.string,
};
