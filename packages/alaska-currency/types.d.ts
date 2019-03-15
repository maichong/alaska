
export interface Currency {
  id: string;
  title: string;
  unit: string;
  format: string;
  precision: number;
  rate: number;
  isDefault: boolean;
  createdAt: string;
}
