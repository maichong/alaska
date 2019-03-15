import { Model } from 'alaska-model';

declare class Currency extends Model { }
interface Currency extends CurrencyFields { }

export interface CurrencyFields {
  title: string;
  unit: string;
  format: string;
  precision: number;
  rate: number;
  isDefault: boolean;
  createdAt: Date;
}

export default Currency;
