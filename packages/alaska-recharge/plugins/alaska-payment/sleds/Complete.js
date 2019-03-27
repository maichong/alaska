"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Recharge_1 = require("../../../models/Recharge");
const Complete_1 = require("../../../sleds/Complete");
const __1 = require("../../..");
async function pre() {
    const me = this;
    let payment = me.params.record;
    if (!payment.recharge)
        return;
    let recharge = await Recharge_1.default.findById(payment.recharge).session(me.dbSession);
    if (!recharge)
        __1.default.error('Can not find recharge record!');
    await Complete_1.default.run({ record: recharge }, { dbSession: me.dbSession });
    me.params.done = true;
}
exports.pre = pre;
