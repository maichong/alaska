import { ObjectMap, Service } from 'alaska';
import { Context } from 'alaska-http';
import User from 'alaska-user/models/User';
import { ActionSledParams } from 'alaska-admin';
import Deposit from './models/Deposit';
import Income from './models/Income';
import Withdraw from './models/Withdraw';

export interface Currency {
  value: string;
  label: string;
  unit: string;
  precision?: number;
  default?: boolean;
}

export class BalanceService extends Service {
  models: {
    Deposit: typeof Deposit;
    Income: typeof Income;
    Withdraw: typeof Withdraw;
  }

  /**
   * 同步获取货币列表，需要在配置加载后可用
   * 如果在JS声明阶段使用，请用异步方法 getCurrenciesAsync()
   */
  currencies: Currency[];
  /**
   * 同步获取货币列表映射
   */
  currenciesMap: ObjectMap<Currency>;
  /**
   * 同步获取默认货币，需要在配置加载后可用
   * 如果在JS声明阶段使用，请用异步方法 getDefaultCurrencyAsync()
   */
  defaultCurrency: Currency;
  /**
   * 异步获取货币列表
   */
  getCurrenciesAsync(): Promise<Currency[]>;
  /**
   * 异步获取默认货币
   */
  getDefaultCurrencyAsync(): Promise<Currency>;
}

declare const balanceService: BalanceService;
export default balanceService;

// Sleds

export interface WithdrawParams {
  ctx: Context;
  withdraw?: Withdraw;
  title?: string;
  note?: string;
  user: User;
  currency?: string;
  amount: number;
}

export interface WithdrawAcceptParams extends ActionSledParams {
  record: Withdraw;
}

export interface WithdrawRejectParams extends ActionSledParams {
  record: Withdraw;
}
