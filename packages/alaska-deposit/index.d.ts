import { Service } from 'alaska';
import Deposit from './models/Deposit';

export class DepositService extends Service {
  models: {
    Deposit: typeof Deposit;
  };
}

declare const depositService: DepositService;

export default depositService;
