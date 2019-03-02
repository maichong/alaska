import { Service } from 'alaska';
import { Context } from 'alaska-http';
import * as mongodb from 'mongodb';
import User from 'alaska-user/models/User';
import { ActionSledParams } from 'alaska-admin';
import Income from './models/Income';

export interface Currency {
  value: string;
  label: string;
  unit: string;
  precision?: number;
  default?: boolean;
}

export class BalanceService extends Service {
  models: {
    Income: typeof Income;
  }

  /**
   * 同步获取货币列表，需要在配置加载后可用
   * 如果在JS声明阶段使用，请用异步方法 getCurrenciesAsync()
   */
  currencies: Currency[];
  /**
   * 同步获取货币列表映射
   */
  currenciesMap: Map<string, Currency>;
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

export interface CreateIncome {
  (amount: number, title: string, type?: string, dbSession?: mongodb.ClientSession): Promise<Income>;
}
