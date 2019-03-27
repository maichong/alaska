"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const Debugger = require("debug");
const alaska_queue_1 = require("alaska-queue");
const debug = Debugger('alaska-queue-redis');
class RedisQueueDriver extends alaska_queue_1.default {
    constructor(options, service) {
        super(options, service);
        this._key = options.key;
        this._driver = redis.createClient(options);
    }
    push(item) {
        debug('push', item);
        return new Promise((resolve, reject) => {
            this._driver.rpush(this._key, JSON.stringify(item), (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    pop(timeout) {
        let method = typeof timeout === 'undefined' ? 'lpop' : 'blpop';
        return new Promise((resolve, reject) => {
            let callback = (error, res) => {
                if (error) {
                    reject(error);
                }
                else {
                    if (res !== null) {
                        try {
                            if (Array.isArray(res)) {
                                res = res[1];
                            }
                            res = JSON.parse(res);
                        }
                        catch (err) {
                            res = null;
                        }
                    }
                    resolve(res);
                }
            };
            if (method === 'lpop') {
                this._driver.lpop(this._key, callback);
            }
            else {
                this._driver.blpop(this._key, Math.floor(timeout / 1000), callback);
            }
        });
    }
    destroy() {
        this._driver.quit();
        this._driver = null;
    }
}
exports.default = RedisQueueDriver;
