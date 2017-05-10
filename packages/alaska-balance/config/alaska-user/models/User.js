import Income from '../../../models/Income';
import Deposit from '../../../models/Deposit';
import Withdraw from '../../../models/Withdraw';

export const relationships = {
  incomes: {
    ref: Income,
    path: 'user',
    private: true
  },
  deposits: {
    ref: Deposit,
    path: 'user',
    private: true
  },
  withdraw: {
    ref: Withdraw,
    path: 'user',
    private: true
  },
};
