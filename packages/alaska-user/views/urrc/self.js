"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    check(user, record) {
        return user && record && String(record.id) === String(user.id);
    }
};
