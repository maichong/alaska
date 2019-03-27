"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const RegisterAbility_1 = require("alaska-user/sleds/RegisterAbility");
const __1 = require("..");
class Init extends alaska_sled_1.Sled {
    exec() {
        alaska_settings_1.default.register({
            id: 'order.paymentTimeout',
            title: 'Payment Timeout',
            service: __1.default.id,
            group: 'Order',
            type: 'NumberFieldView',
            value: 3600,
            options: {
                addonAfter: 'Second'
            }
        });
        alaska_settings_1.default.register({
            id: 'order.receiveTimeout',
            title: 'Receive Timeout',
            service: __1.default.id,
            group: 'Order',
            type: 'NumberFieldView',
            value: 86400 * 10,
            options: {
                addonAfter: 'Second'
            }
        });
        alaska_settings_1.default.register({
            id: 'order.refundTimeout',
            title: 'Refund Timeout',
            service: __1.default.id,
            group: 'Order',
            type: 'NumberFieldView',
            value: 86400 * 2,
            options: {
                addonAfter: 'Second'
            }
        });
        alaska_settings_1.default.register({
            id: 'order.needConfirm',
            title: 'Need Confirm',
            service: __1.default.id,
            group: 'Order',
            type: 'CheckboxFieldView'
        });
        RegisterAbility_1.default.run({
            id: 'alaska-order.Order.cancel:user',
            title: 'cancel own Order'
        });
        RegisterAbility_1.default.run({
            id: 'alaska-order.Order.receive:user',
            title: 'receive own Order'
        });
        RegisterAbility_1.default.run({
            id: 'alaska-order.Order.refund:user',
            title: 'apply refund own Order'
        });
    }
}
exports.default = Init;
