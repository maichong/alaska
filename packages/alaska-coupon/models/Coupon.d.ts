import { Model, RecordId } from 'alaska-model';

declare class Coupon extends Model { }
interface Coupon extends CouponFields { }

export interface CouponFields {
  code: string;
  title: string;
  user: RecordId;
  used: boolean;
  type: 'rate' | 'amount';
  rate: number;
  amount: number;
  starting: number;
  shop: RecordId;
  cats: RecordId[];
  goods: RecordId[];
  createdAt: Date;
  expiredAt: Date;
}

export default Coupon;
