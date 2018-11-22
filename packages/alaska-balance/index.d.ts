import { Service } from 'alaska';
import { Context } from 'alaska-http';
import User from 'alaska-user/models/User';
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

export interface CurrencyMap {
  [x: string]: Currency;
}

declare class BalanceService extends Service {
  models: {
    Deposit: typeof Deposit;
    Income: typeof Income;
    Withdraw: typeof Withdraw;
  }
  currencies: Currency[];
  currenciesMap: CurrencyMap;
  defaultCurrency: Currency;
  getCurrenciesAsync(): Promise<Currency[]>;
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

export interface WithdrawAcceptParams {
  ctx: Context;
  withdraw: Withdraw;
}

export interface WithdrawRejectParams {
  ctx: Context;
  withdraw: Withdraw;
  body: {
    [x: string]: any;
  };
}
