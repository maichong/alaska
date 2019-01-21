import { Service } from 'alaska';
import { Context } from 'alaska-http';
import { ActionSledParams } from 'alaska-admin';
import User from 'alaska-user/models/User';
import Withdraw from './models/Withdraw';
import Create from './sleds/Create';
import Accept from './sleds/Accept';
import Reject from './sleds/Reject';

// Sleds

export interface CreateParams {
  ctx: Context;
  withdraw?: Withdraw;
  title?: string;
  note?: string;
  user: User;
  currency?: string;
  amount: number;
}

export interface AcceptParams extends ActionSledParams {
  record: Withdraw;
}

export interface RejectParams extends ActionSledParams {
  record: Withdraw;
}

// Service
export class WithdrawService extends Service {
  models: {
    Withdraw: typeof Withdraw;
  };

  sleds: {
    Create: typeof Create;
    Accept: typeof Accept;
    Reject: typeof Reject;
  };
}

declare const userService: WithdrawService;

export default userService;
