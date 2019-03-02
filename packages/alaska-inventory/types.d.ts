
export interface Inventory {
  id: string;
  title: string;
  user: string;
  goods: string;
  sku: string;
  type: 'input' | 'output';
  quantity: number;
  inventory: number;
  createdAt: string;
}
