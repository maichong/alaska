import { Service } from 'alaska';
import { RecordId } from 'alaska-model';
import Recharge from './models/Recharge';
import Complete from './sleds/Complete';

declare module 'alaska-payment/models/Payment' {
  export interface PaymentFields {
    recharge: RecordId;
  }
}

export class RechargeService extends Service {
  models: {
    Recharge: typeof Recharge;
  };
  sleds: {
    Complete: typeof Complete;
  }
}

export interface CompleteParams {
  record: Recharge;
}

declare const rechargeService: RechargeService;

export default rechargeService;
