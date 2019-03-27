"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    return {
        check(user, record) {
            return String(record.id) === String(user.id);
        },
        filter(user) {
            return {
                _id: user._id || user.id
            };
        }
    };
}
exports.default = default_1;
