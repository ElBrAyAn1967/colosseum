import PropTypes from 'prop-types';

/**
 * Card component with header, body, and footer
 */
export default function Card({
  children,
  hover = false,
  gradient = false,
  className = '',
}) {
  const baseClass = hover ? 'card-hover' : gradient ? 'card-gradient' : 'card';
  const classes = `${baseClass} ${className}`.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool,
  gradient: PropTypes.bool,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
