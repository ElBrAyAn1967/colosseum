import PropTypes from 'prop-types';
import Card, { CardBody } from '../../common/Card';

/**
 * Display user statistics and reputation
 */
export default function UserStats({ profile }) {
  const stats = [
    {
      label: 'Total Trades',
      value: profile?.totalTrades || 0,
      icon: '📊',
    },
    {
      label: 'Successful',
      value: profile?.successfulTrades || 0,
      icon: '✅',
    },
    {
      label: 'Disputed',
      value: profile?.disputedTrades || 0,
      icon: '⚠️',
    },
    {
      label: 'Success Rate',
      value: profile?.totalTrades > 0
        ? `${((profile.successfulTrades / profile.totalTrades) * 100).toFixed(1)}%`
        : 'N/A',
      icon: '🎯',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <div className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-tipjar-secondary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

UserStats.propTypes = {
  profile: PropTypes.shape({
    totalTrades: PropTypes.number,
    successfulTrades: PropTypes.number,
    disputedTrades: PropTypes.number,
  }),
};
