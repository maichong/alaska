import Income from '../../../models/Income';
import Deposit from '../../../models/Deposit';
import Withdraw from '../../../models/Withdraw';

export const relationships = {
  incomes: {
    ref: Income,
    path: 'user'
  },
  deposits: {
    ref: Deposit,
    path: 'user'
  },
  withdraw: {
    ref: Withdraw,
    path: 'user'
  },
};
