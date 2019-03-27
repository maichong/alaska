"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Session {
    constructor(ctx, obj) {
        this._ctx = ctx;
        if (!obj) {
            this.isNew = true;
        }
        else {
            for (let k of Object.keys(obj)) {
                this[k] = obj[k];
            }
        }
    }
    get length() {
        return Object.keys(this.toJSON()).length;
    }
    toJSON() {
        let me = this;
        let obj = {};
        Object.keys(this).forEach((key) => {
            if (key === 'isNew' || key[0] === '_')
                return;
            obj[key] = me[key];
        });
        return obj;
    }
    isChanged(prev) {
        if (!prev) {
            return true;
        }
        return JSON.stringify(this) !== prev;
    }
}
exports.default = Session;
