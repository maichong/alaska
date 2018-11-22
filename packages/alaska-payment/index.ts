import { Service } from 'alaska';
import PaymentPlugin from './plugin';

export { PaymentPlugin };

class PaymentService extends Service {

}

export default new PaymentService({
  id: 'alaska-payment'
});
