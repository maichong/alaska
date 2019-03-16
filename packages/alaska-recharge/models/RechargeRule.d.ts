import { Model } from 'alaska-model';

declare class RechargeRule extends Model {
}
interface RechargeRule extends RechargeRuleFields { }

export interface RechargeRuleFields {
  payment: string;
  target: 'account' | 'deposit';
  rechargeAccount: string;
  type: 'rate' | 'amount';
  paymentCurrency: string;
  paymentAmount: number;
  rechargeCurrency: string;
  rechargeAmount: number;
  rate: number;
  createdAt: Date;
}

export default RechargeRule;
