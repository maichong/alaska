// @flow

import { Sled } from 'alaska';
import SETTINGS from 'alaska-settings';
import service from '../';

export default class Init extends Sled {
  exec() {
    SETTINGS.register({
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
    SETTINGS.register({
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
    SETTINGS.register({
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
  }
}
