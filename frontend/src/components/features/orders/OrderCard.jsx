import PropTypes from 'prop-types';
import Card, { CardHeader, CardBody, CardFooter } from '../../common/Card';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import { formatAmount } from '../../../utils/helpers';

/**
 * Order card component for marketplace
 */
export default function OrderCard({ order, onAccept }) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">#{order.orderId}</h3>
          <Badge status={order.status}>{order.status}</Badge>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-4">
          {/* Amount */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount</span>
            <span className="font-mono font-bold text-tipjar-secondary text-lg">
              {formatAmount(order.amount)} {order.tokenType}
            </span>
          </div>

          {/* Price in MXN */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price</span>
            <span className="font-mono text-lg">
              ${formatAmount(order.amountMxn)} MXN
            </span>
          </div>

          {/* Exchange Rate */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Rate</span>
            <span className="font-mono text-sm text-gray-300">
              1 {order.tokenType} = ${(order.amountMxn / order.amount).toFixed(2)} MXN
            </span>
          </div>

          <div className="divider"></div>

          {/* Seller Info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-solana"></div>
              <div>
                <p className="text-sm font-medium">Seller</p>
                <p className="text-xs text-gray-400 font-mono">
                  {order.seller.slice(0, 4)}...{order.seller.slice(-4)}
                </p>
              </div>
            </div>
            <Badge variant="success">Verified</Badge>
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onAccept(order)}
        >
          Accept Order
        </Button>
      </CardFooter>
    </Card>
  );
}

OrderCard.propTypes = {
  order: PropTypes.shape({
    orderId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    amountMxn: PropTypes.number.isRequired,
    tokenType: PropTypes.string.isRequired,
    seller: PropTypes.string.isRequired,
  }).isRequired,
  onAccept: PropTypes.func.isRequired,
};
