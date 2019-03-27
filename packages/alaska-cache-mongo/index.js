"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const mongodb = require("mongodb");
const Debugger = require("debug");
const alaska_cache_1 = require("alaska-cache");
const _ = require("lodash");
const debug = Debugger('alaska-cache-mongo');
class MongoCacheDriver extends alaska_cache_1.default {
    constructor(options, service) {
        super(options, service);
        this._maxAge = options.maxAge || 0;
        let info = url.parse(options.uri);
        if (!info.path) {
            throw new Error('mongodb uri error');
        }
        let mongoOpts = _.omit(options, 'id', 'uri', 'type', 'collection', 'maxAge');
        mongoOpts.useNewUrlParser = true;
        mongoOpts.autoReconnect = true;
        this._connecting = mongodb.MongoClient.connect(options.uri, mongoOpts);
        this._connecting.then((client) => {
            let db = client.db(info.path.substr(1));
            this._client = client;
            this._connecting = null;
            this._driver = db.collection(options.collection || 'mongo_cache');
            this._driver.createIndex('expiredAt', {
                background: true
            });
        }, (error) => {
            console.error(error.stack);
            process.exit(1);
        });
        this._pruneTimer = global.setInterval(() => {
            this.prune();
        }, 10 * 60 * 1000);
    }
    set(key, value, lifetime) {
        if (this._connecting) {
            return this._connecting.then(() => this.set(key, value, lifetime));
        }
        debug('set', key, '=>', value, '(', typeof lifetime !== 'undefined' ? lifetime : `{${this._maxAge}}`, ')');
        lifetime = typeof lifetime === 'undefined' ? this._maxAge : lifetime;
        let expiredAt = 0;
        if (lifetime) {
            expiredAt = new Date(Date.now() + lifetime);
        }
        return this._driver.findOneAndReplace({
            _id: key
        }, {
            _id: key,
            value,
            expiredAt
        }, {
            upsert: true,
            returnOriginal: false
        }).then(() => Promise.resolve());
    }
    get(key) {
        if (this._connecting) {
            return this._connecting.then(() => this.get(key));
        }
        return this._driver.findOne({
            _id: key
        }).then((doc) => {
            if (!doc) {
                debug('get', key, '=>', null);
                return Promise.resolve(null);
            }
            if (doc.expiredAt !== 0 && (!doc.expiredAt || doc.expiredAt < new Date())) {
                debug('get', key, '=>', null);
                this.del(key);
                return null;
            }
            debug('get', key, '=>', doc.value);
            return Promise.resolve(doc.value);
        });
    }
    del(key) {
        if (this._connecting) {
            return this._connecting.then(() => this.del(key));
        }
        debug('del', key);
        return this._driver.deleteOne({
            _id: key
        }).then(() => Promise.resolve());
    }
    has(key) {
        if (this._connecting) {
            return this._connecting.then(() => this.has(key));
        }
        return this._driver.findOne({
            _id: key
        }).then((doc) => {
            if (!doc) {
                debug('has', key, '=>', false);
                return Promise.resolve(false);
            }
            if (doc.expiredAt !== 0 && (!doc.expiredAt || doc.expiredAt < new Date())) {
                return this.del(key).then(() => Promise.resolve(false));
            }
            debug('has', key, '=>', true);
            return Promise.resolve(true);
        });
    }
    inc(key) {
        if (this._connecting) {
            return this._connecting.then(() => this.inc(key));
        }
        let expiredAt = 0;
        if (this._maxAge) {
            expiredAt = new Date(Date.now() + this._maxAge);
        }
        return this._driver.findOneAndUpdate({ _id: key }, {
            $inc: { value: 1 }, $set: { expiredAt }
        }, { upsert: true, returnOriginal: false }).then((doc) => {
            debug('inc', key, '=>', doc.value.value);
            return Promise.resolve(doc.value.value);
        });
    }
    dec(key) {
        if (this._connecting) {
            return this._connecting.then(() => this.dec(key));
        }
        let expiredAt = 0;
        if (this._maxAge) {
            expiredAt = new Date(Date.now() + this._maxAge);
        }
        return this._driver.findOneAndUpdate({ _id: key }, {
            $inc: { value: -1 }, $set: { expiredAt }
        }, { upsert: true, returnOriginal: false }).then((doc) => {
            debug('dec', key, '=>', doc.value.value);
            return Promise.resolve(doc.value.value);
        });
    }
    size() {
        if (this._connecting) {
            return this._connecting.then(() => this.size());
        }
        debug('size');
        return this._driver.countDocuments();
    }
    prune() {
        if (this._connecting) {
            return this._connecting.then(() => this.prune());
        }
        debug('prune');
        return this._driver.deleteMany({
            $or: [
                { expiredAt: null },
                {
                    expiredAt: { $ne: 0, $lt: new Date() }
                }
            ]
        }).then(() => { });
    }
    flush() {
        if (this._connecting) {
            return this._connecting.then(() => this.flush());
        }
        debug('flush');
        return this._driver.drop();
    }
    destroy() {
        clearInterval(this._pruneTimer);
        this._client.close();
        this._client = null;
        this._driver = null;
    }
}
exports.default = MongoCacheDriver;
