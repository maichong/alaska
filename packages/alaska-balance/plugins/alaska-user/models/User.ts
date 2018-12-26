import * as _ from 'lodash';
import Income from '../../../models/Income';
import Deposit from '../../../models/Deposit';
import Withdraw from '../../../models/Withdraw';
import service from '../../../';

export default {
  relationships: {
    incomes: {
      ref: Income,
      path: 'user',
      protected: true
    },
    deposits: {
      ref: Deposit,
      path: 'user',
      protected: true
    },
    withdraw: {
      ref: Withdraw,
      path: 'user',
      protected: true
    },
  },

  /**
   * 为User模型增加余额字段和income方法
   */
  preRegister() {
    const User = this;
    service.currencies.forEach((c) => {
      User.underscoreMethod(c.value, 'income', async function (amount: number, title: string, type?: string) {
        let user = this;
        let balance = (user.get(c.value) + amount) || 0;
        if (typeof c.precision !== 'undefined') {
          balance = _.round(balance, c.precision);
        }
        user.set(c.value, balance);
        let income = new Income({
          type,
          title,
          amount,
          balance,
          target: 'balance',
          currency: c.value,
          user
        });
        await income.save();
        await user.save();
      });
      if (User.fields[c.value]) return;
      let format = '0,0';
      if (c.precision) {
        format += '.' + _.repeat('0', c.precision)
      }
      User.fields[c.value] = {
        label: c.label,
        type: Number,
        default: 0,
        addonAfter: c.unit,
        format,
        disabled: [{
          ability: 'root'
        }]
      };
    });
  }
};
