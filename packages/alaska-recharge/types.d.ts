
export interface Recharge {
  id: string;
  title: string;
  user: string;
  target: 'account' | 'deposit';
  currency: string;
  deposit: string;
  amount: number;
  type: string;
  payment: string;
  state: 'pending' | 'success' | 'failed';
  createdAt: string;
}

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
  createdAt: string;
}
