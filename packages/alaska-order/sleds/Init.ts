import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import RegisterAbility from 'alaska-user/sleds/RegisterAbility';
import service from '..';

export default class Init extends Sled<any, void> {
  exec() {
    settingsService.register({
      id: 'order.paymentTimeout',
      title: 'Payment Timeout',
      service: service.id,
      group: 'Order',
      type: 'NumberFieldView',
      value: 3600,
      options: {
        addonAfter: 'Second'
      }
    });
    settingsService.register({
      id: 'order.receiveTimeout',
      title: 'Receive Timeout',
      service: service.id,
      group: 'Order',
      type: 'NumberFieldView',
      value: 86400 * 10,
      options: {
        addonAfter: 'Second'
      }
    });
    settingsService.register({
      id: 'order.refundTimeout',
      title: 'Refund Timeout',
      service: service.id,
      group: 'Order',
      type: 'NumberFieldView',
      value: 86400 * 2,
      options: {
        addonAfter: 'Second'
      }
    });

    RegisterAbility.run({
      id: 'alaska-order.Order.cancel:user',
      title: 'cancel own Order'
    });

    RegisterAbility.run({
      id: 'alaska-order.Order.receive:user',
      title: 'receive own Order'
    });

    RegisterAbility.run({
      id: 'alaska-order.Order.refund:user',
      title: 'apply refund own Order'
    });
  }
}
