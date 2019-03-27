"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    check(user, record) {
        return user && record && record.user && String(record.user) === String(user.id);
    }
};
