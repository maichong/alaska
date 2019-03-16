import { Service, Plugin } from 'alaska';
import { RecordId } from 'alaska-model';
import User from 'alaska-user/models/User';
import Income from './models/Income';
import Create from './sleds/Create';

export class IncomeService extends Service {
  models: {
    Income: typeof Income;
  };
  sleds: {
    Create: typeof Create;
  };
}

declare const incomeService: IncomeService;

export default incomeService;

export interface CreateParams {
  user: User;
  title: string;
  amount: number;
  account?: string;
  deposit?: RecordId;
  type?: string;
}
