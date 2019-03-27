"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const Debugger = require("debug");
const alaska_cache_1 = require("alaska-cache");
const debug = Debugger('alaska-cache-redis');
class RedisCacheDriver extends alaska_cache_1.default {
    constructor(options, service) {
        super(options, service);
        this._maxAge = options.maxAge || 0;
        this._driver = redis.createClient(options);
    }
    set(key, value, lifetime) {
        debug('set', key, '=>', value, '(', typeof lifetime !== 'undefined' ? lifetime : `{${this._maxAge}}`, ')');
        let ms = typeof lifetime === 'undefined' ? this._maxAge : lifetime;
        return new Promise((resolve, reject) => {
            let args = [key, JSON.stringify(value)];
            if (ms) {
                args.push('PX', ms);
            }
            args.push((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
            this._driver.set.apply(this._driver, args);
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this._driver.get(key, (error, res) => {
                if (error) {
                    reject(error);
                }
                else {
                    let obj;
                    if (res !== null) {
                        try {
                            obj = JSON.parse(res);
                        }
                        catch (err) {
                            obj = null;
                        }
                    }
                    debug('get', key, '=>', obj);
                    resolve(obj);
                }
            });
        });
    }
    del(key) {
        debug('del', key);
        return new Promise((resolve, reject) => {
            this._driver.del(key, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    has(key) {
        return new Promise((resolve, reject) => {
            this._driver.exists(key, (error, exists) => {
                if (error) {
                    reject(error);
                }
                else {
                    debug('has', key, '=>', !!exists);
                    resolve(!!exists);
                }
            });
        });
    }
    inc(key) {
        return new Promise((resolve, reject) => {
            this._driver.incr(key, (error, res) => {
                if (error) {
                    reject(error);
                }
                else {
                    debug('inc', key, '=>', res);
                    resolve(res);
                }
            });
        });
    }
    dec(key) {
        return new Promise((resolve, reject) => {
            this._driver.decr(key, (error, res) => {
                if (error) {
                    reject(error);
                }
                else {
                    debug('inc', key, '=>', res);
                    resolve(res);
                }
            });
        });
    }
    size() {
        return new Promise((resolve, reject) => {
            this._driver.dbsize((error, size) => {
                if (error) {
                    reject(error);
                }
                else {
                    debug('size', size);
                    resolve(size);
                }
            });
        });
    }
    prune() {
        debug('prune');
        return Promise.resolve();
    }
    flush() {
        debug('flush');
        return new Promise((resolve, reject) => {
            this._driver.flushdb((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    destroy() {
        this._driver.quit();
        this._driver = null;
    }
}
exports.default = RedisCacheDriver;
