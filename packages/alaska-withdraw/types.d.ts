
export interface Withdraw {
  id: string;
  title: string;
  user: string;
  currency: string;
  account: string;
  amount: number;
  type: string;
  ip: string;
  remark: string;
  createdAt: string;
  state: 'pending' | 'accepted' | 'rejected';
  reason: string;
}
