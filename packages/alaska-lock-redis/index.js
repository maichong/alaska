"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Debugger = require("debug");
const redis = require("redis");
const Redlock = require("redlock");
const alaska_lock_1 = require("alaska-lock");
const debug = Debugger('alaska-lock-redis');
class RedisLockDriver extends alaska_lock_1.default {
    constructor(options, service) {
        super(options, service);
        let servers = [];
        if (options.servers instanceof Array) {
            servers = options.servers.map((server) => redis.createClient(server));
        }
        else {
            servers.push(redis.createClient(options.servers));
        }
        if (!options.retryCount)
            options.retryCount = 10;
        if (!options.retryDelay)
            options.retryDelay = 200;
        this._driver = new Redlock(servers, options);
    }
    async lock(ttl) {
        let resource = this.options.resource;
        debug('lock', resource);
        if (!resource) {
            throw new Error('Missing resource for lock');
        }
        ttl = ttl || this.options.ttl || 2000;
        let lock = await this._driver.lock(resource, ttl);
        this._lock = lock;
        this._value = lock.value;
        debug('locked', resource, lock.value);
    }
    async extend(ttl) {
        debug('extend', this.options.resource, this._value);
        ttl = ttl || this.options.ttl || 2000;
        let lock = await this._lock.extend(ttl);
        this._lock = lock;
        this._value = lock.value;
    }
    async unlock() {
        debug('unlock', this.options.resource, this._value);
        await this._lock.unlock();
        this._value = null;
    }
}
exports.default = RedisLockDriver;
