import { Model, RecordId } from 'alaska-model';

declare class CouponTemplate extends Model { }
interface CouponTemplate extends CouponTemplateFields { }

export interface CouponTemplateFields {
  code: string;
  title: string;
  activated: boolean;
  type: 'rate' | 'amount';
  rate: number;
  amount: number;
  starting: number;
  shop: RecordId;
  cats: RecordId[];
  goods: RecordId[];
  couponPeriod: number;
  couponExpiredAt: Date;
  createdAt: Date;
  expiredAt: Date;
}

export default CouponTemplate;
