"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Debugger = require("debug");
const alaska_queue_1 = require("alaska-queue");
const debug = Debugger('alaska-queue-redis');
const queues = {};
function sleep(seconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}
class RedisQueueDriver extends alaska_queue_1.default {
    constructor(config, service) {
        super(config, service);
        this._key = config.key;
        this._free = false;
        if (!queues[this._key]) {
            queues[this._key] = [];
        }
    }
    driver() {
        return queues;
    }
    async push(item) {
        debug('push', item);
        this._free = false;
        queues[this._key].push(item);
    }
    async pop(timeout) {
        this._free = false;
        if (timeout === 0) {
            timeout = Infinity;
        }
        if (typeof timeout === 'undefined') {
            timeout = 0;
        }
        while (!queues[this._key].length && timeout > 0) {
            await sleep(1);
            timeout -= 1000;
            if (this._free) {
                return null;
            }
        }
        return queues[this._key].shift();
    }
    destroy() {
    }
}
exports.default = RedisQueueDriver;
