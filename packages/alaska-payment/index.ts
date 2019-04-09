import { Service } from 'alaska';
import PaymentPlugin from './plugin';

export { PaymentPlugin };

class PaymentService extends Service {
  paymentPlugins = new Map();
}

export default new PaymentService({
  id: 'alaska-payment'
});
