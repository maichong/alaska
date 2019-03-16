import { Service } from 'alaska';
import { RecordId } from 'alaska-model';
import Commission from './models/Commission';
import Order from 'alaska-order/models/Order';
import User from 'alaska-user/models/User';
import Create from './sleds/Create';
import Balance from './sleds/Balance';

declare module 'alaska-user/models/User' {
  export interface UserFields {
    promoter: RecordId;
  }
}

export class CommissionService extends Service {
  models: {
    Commission: typeof Commission;
  };
  sleds: {
    Create: typeof Create;
    Balance: typeof Balance;
  };
}

declare const commissionService: CommissionService;

export default commissionService;

export interface CreateParams {
  /**
   * 佣金所属用户
   */
  user: RecordId | User;
  /**
   * 贡献者ID（下线），默认为 order.user
   */
  contributor?: RecordId;
  /**
   * 余额账户
   */
  account: string;
  /**
   * 佣金金额
   * amount 或 price+rate 或 price+(level+commissionRates设置) 必须
   */
  amount?: number;
  /**
   * 佣金显示标题，默认为 order.title
   */
  title?: string;
  /**
   * 佣金关联的订单
   */
  order?: Order;
  /**
   * 主佣金
   */
  main?: RecordId;
  /**
   * 订单价格，默认为 order.payed
   */
  price?: number;
  /**
   * 佣金比例
   */
  rate?: number;
  /**
   * 佣金级别
   */
  level?: number;
}

export interface BalanceParams {
  record: Commission;
}
