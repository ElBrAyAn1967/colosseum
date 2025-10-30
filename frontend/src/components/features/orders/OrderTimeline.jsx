import PropTypes from 'prop-types';

/**
 * Visual timeline showing order progress
 */
export default function OrderTimeline({ currentStatus }) {
  const steps = [
    { key: 'open', label: 'Open' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'funded', label: 'Funded' },
    { key: 'payment-confirmed', label: 'Payment Confirmed' },
    { key: 'completed', label: 'Completed' },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStatus.toLowerCase());
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-tipjar-dark-lighter">
          <div
            className="h-full bg-gradient-solana transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isCompleted
                    ? 'bg-tipjar-primary border-tipjar-primary'
                    : 'bg-tipjar-dark-light border-gray-600'
                  }
                  ${isCurrent ? 'ring-4 ring-tipjar-primary/30' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-gray-500 text-xs">{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-xs ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

OrderTimeline.propTypes = {
  currentStatus: PropTypes.string.isRequired,
};
