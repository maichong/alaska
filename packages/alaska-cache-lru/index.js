"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LRUCache = require("lru-cache");
const Debugger = require("debug");
const alaska_cache_1 = require("alaska-cache");
const debug = Debugger('alaska-cache-lru');
class LruCacheDriver extends alaska_cache_1.default {
    constructor(options, service) {
        super(options, service);
        this._maxAge = options.maxAge || 0;
        this._driver = new LRUCache(options);
    }
    set(key, value, lifetime) {
        debug('set', key, '=>', value, '(', typeof lifetime !== 'undefined' ? lifetime : `{${this._maxAge}}`, ')');
        return Promise.resolve(this._driver.set(key, value, lifetime));
    }
    get(key) {
        let value = this._driver.get(key);
        debug('get', key, '=>', value);
        return Promise.resolve(value);
    }
    del(key) {
        debug('del', key);
        return Promise.resolve(this._driver.del(key));
    }
    has(key) {
        let exists = this._driver.has(key);
        debug('has', key, '=>', exists);
        return Promise.resolve(exists);
    }
    inc(key) {
        let value = this._driver.get(key);
        if (!value) {
            value = 0;
        }
        value += 1;
        this._driver.set(key, value);
        debug('inc', key, '=>', value);
        return Promise.resolve(value);
    }
    dec(key) {
        let value = this._driver.get(key);
        if (!value) {
            value = 0;
        }
        value -= 1;
        this._driver.set(key, value);
        debug('inc', key, '=>', value);
        return Promise.resolve(value);
    }
    size() {
        debug('size', this._driver.itemCount);
        return Promise.resolve(this._driver.itemCount);
    }
    prune() {
        debug('prune');
        this._driver.prune();
        return Promise.resolve();
    }
    flush() {
        debug('flush');
        this._driver.reset();
        return Promise.resolve();
    }
    destroy() {
        this._driver.reset();
        this._driver = null;
    }
}
exports.default = LruCacheDriver;
