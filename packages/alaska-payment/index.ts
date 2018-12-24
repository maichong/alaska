import { Service } from 'alaska';
import PaymentPlugin from './plugin';

export { PaymentPlugin };

class PaymentService extends Service {
  payments={};
}

export default new PaymentService({
  id: 'alaska-payment'
});
