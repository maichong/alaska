
export interface Withdraw {
  id: string;
  title: string;
  user: string;
  currency: string;
  amount: number;
  note: string;
  createdAt: string;
  state: 'pending' | 'accepted' | 'rejected';
  reason: string;
}
