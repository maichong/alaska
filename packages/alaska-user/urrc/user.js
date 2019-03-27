"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("alaska-model/utils");
function default_1(options) {
    let field = (options && options.user) || 'user';
    return {
        check(user, record) {
            return utils_1.isIdEqual(record[field], user.id);
        },
        filter(user) {
            return {
                [field]: user._id || user.id
            };
        }
    };
}
exports.default = default_1;
