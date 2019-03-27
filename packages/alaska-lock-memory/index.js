"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Debugger = require("debug");
const alaska_lock_1 = require("alaska-lock");
const random = require("string-random");
const delay_1 = require("delay");
const debug = Debugger('alaska-lock-memory');
const locks = new Map();
class MemoryLockDriver extends alaska_lock_1.default {
    constructor(options, service) {
        super(options, service);
        this._driver = locks;
        this.id = '';
    }
    lock(ttl) {
        if (this.locked || this.id)
            return Promise.reject(new Error('Aready locked'));
        let retryCount = this.options.retryCount || 10;
        let retryDelay = this.options.retryDelay || 200;
        let resource = this.options.resource;
        if (!resource) {
            throw new Error('Missing resource for lock');
        }
        ttl = ttl || this.options.ttl || 2000;
        let id = random();
        this.id = id;
        let me = this;
        function tryLock() {
            let item = locks.get(resource);
            if (!item) {
                let now = Date.now();
                item = {
                    id,
                    expiredAt: now + ttl,
                    timer: global.setTimeout(() => {
                        let cur = locks.get(resource);
                        if (cur && cur.id === id) {
                            locks.delete(resource);
                            me.locked = false;
                            me.id = '';
                            debug(`lock timeout ${resource}`);
                        }
                    }, ttl)
                };
                locks.set(resource, item);
                me.locked = true;
                debug(`locked ${resource}`);
                return Promise.resolve();
            }
            retryCount -= 1;
            if (retryCount < 1) {
                me.id = '';
                return Promise.reject(new Error('Lock failed!'));
            }
            return delay_1.default(retryDelay).then(tryLock);
        }
        return tryLock();
    }
    extend(ttl) {
        if (!this.locked)
            return Promise.reject(new Error('Extend lock failed, not locked yet.'));
        let resource = this.options.resource;
        let item = locks.get(resource);
        if (!item || item.id !== this.id)
            return Promise.reject(new Error('Extend lock failed.'));
        ttl = ttl || this.options.ttl || 2000;
        clearTimeout(item.timer);
        item.expiredAt += ttl;
        let me = this;
        item.timer = global.setTimeout(() => {
            let cur = locks.get(resource);
            if (cur && cur.id === me.id) {
                locks.delete(resource);
                me.id = '';
                me.locked = false;
                debug(`lock timeout ${resource}`);
            }
        }, item.expiredAt - Date.now());
        debug(`extend lock ${resource} ${ttl}`);
        return Promise.resolve();
    }
    unlock() {
        if (!this.locked)
            return Promise.resolve();
        let resource = this.options.resource;
        let item = locks.get(resource);
        let id = this.id;
        this.id = '';
        this.locked = false;
        if (item && item.id === id) {
            clearTimeout(item.timer);
            locks.delete(resource);
            debug(`unlock ${resource}`);
        }
        return Promise.resolve();
    }
}
exports.default = MemoryLockDriver;
