"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const Debugger = require("debug");
const alaska_subscribe_1 = require("alaska-subscribe");
const debug = Debugger('alaska-subscribe-redis');
class RedisSubscribeDriver extends alaska_subscribe_1.default {
    constructor(options, service) {
        super(options, service);
        this.channel = options.channel;
        this._driver = redis.createClient(options);
        this._subscribed = false;
        this._messages = [];
        this._onMessage = null;
        this._listener = null;
    }
    publish(message) {
        debug('publish', message);
        if (this._subscribed) {
            return Promise.reject(new Error('can not publish message with subscribed driver.'));
        }
        return new Promise((resolve, reject) => {
            this._driver.publish(this.channel, JSON.stringify(message), (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    subscribe() {
        debug('subscribe', this.channel);
        if (this._subscribed) {
            return Promise.reject(new Error('driver has already subscribed.'));
        }
        this._subscribed = true;
        return new Promise((resolve, reject) => {
            this._driver.subscribe(this.channel, (error, res) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
            this._listener = (channel, message) => {
                try {
                    let json = JSON.parse(message);
                    this._messages.push(json);
                    if (this._onMessage) {
                        this._onMessage();
                    }
                }
                catch (e) {
                }
            };
            this._driver.on('message', this._listener);
        });
    }
    read(timeout) {
        debug('read');
        if (!this._subscribed) {
            return Promise.reject(new Error('the driver is not subscribed.'));
        }
        if (this._messages.length) {
            return Promise.resolve(this._messages.shift());
        }
        if (typeof timeout === 'undefined') {
            timeout = Infinity;
        }
        return new Promise((resolve) => {
            let timer;
            this._onMessage = () => {
                this._onMessage = null;
                if (timer) {
                    clearTimeout(timer);
                }
                resolve(this._messages.shift());
            };
            if (timeout && timeout !== Infinity) {
                timer = global.setTimeout(() => {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    this._onMessage = null;
                    resolve(null);
                }, timeout);
                this._timer = timer;
            }
        });
    }
    once(timeout) {
        debug('once');
        if (this._subscribed) {
            return Promise.reject(new Error('driver has already subscribed.'));
        }
        this._subscribed = true;
        if (typeof timeout === 'undefined') {
            timeout = Infinity;
        }
        return new Promise((resolve, reject) => {
            this._driver.subscribe(this.channel, (error) => {
                if (error) {
                    reject(error);
                }
            });
            this._listener = (channel, message) => {
                try {
                    let json = JSON.parse(message);
                    this.cancel();
                    resolve(json);
                }
                catch (e) {
                }
            };
            this._driver.on('message', this._listener);
            if (timeout && timeout !== Infinity) {
                this._timer = global.setTimeout(() => {
                    this.cancel();
                    resolve(null);
                }, timeout);
            }
        });
    }
    cancel() {
        debug('cancel');
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }
        if (!this._subscribed) {
            return Promise.resolve();
        }
        this._subscribed = false;
        return new Promise((resolve, reject) => {
            this._driver.unsubscribe(this.channel, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
            if (this._listener) {
                this._driver.removeListener('message', this._listener);
                this._listener = null;
            }
        });
    }
    free() {
        this.cancel();
        this._messages = [];
        this._onMessage = null;
    }
    destroy() {
        let destroy = () => {
            this._messages = [];
            this._onMessage = null;
            this._driver = null;
        };
        this.cancel().then(destroy, destroy);
    }
}
exports.default = RedisSubscribeDriver;
