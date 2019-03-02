
export interface Commission {
  id: string;
  title: string;
  user: string;
  contributor: string;
  order: string;
  main: string;
  level: number;
  currency: string;
  amount: number;
  state: 'pending' | 'balanced' | 'failed';
  failure: string;
  createdAt: string;
  balancedAt: string;
}
