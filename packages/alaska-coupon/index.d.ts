import { Service } from 'alaska';
import CouponTemplate from './models/CouponTemplate';
import Coupon from './models/Coupon';

export class CouponService extends Service {
  models: {
    CouponTemplate: typeof CouponTemplate;
    Coupon: typeof Coupon;
  };
}

declare const couponService: CouponService;

export default couponService;
