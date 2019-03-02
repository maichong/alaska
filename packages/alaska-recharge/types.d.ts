
export interface Recharge {
  id: string;
  title: string;
  user: string;
  target: 'balance' | 'deposit';
  currency: string;
  deposit: string;
  amount: number;
  type: string;
  payment: string;
  state: 'pending' | 'success' | 'failed';
  createdAt: string;
}
