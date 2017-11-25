import RECHARGE from 'alaska-recharge';
import Recharge from 'alaska-recharge/models/Recharge';

// fix bug
Recharge.service = RECHARGE;

export const fields = {
  recharge: {
    label: 'Recharge Record',
    ref: Recharge,
    private: true
  }
};
