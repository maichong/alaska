"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const random = require("string-random");
function sortHooks(a, b) {
    if (a._before === '*')
        return -1;
    if (a._after === '*')
        return 1;
    if (b._before === '*')
        return 1;
    if (b._after === '*')
        return -1;
    if (a._id && b._before === a._id)
        return 1;
    if (b._id && a._after === b._id)
        return 1;
    if (a._id && b._after === a._id)
        return -1;
    if (b._id && a._before === b._id)
        return -1;
    return 0;
}
class Sled {
    constructor(params) {
        this.instanceOfSled = true;
        this.params = params || {};
        this.task = null;
        this.dbSession = null;
    }
    static lookup(ref) {
        let service = this.service || this.main;
        let sled;
        if (ref.indexOf('.') > -1) {
            let [serviceId, sledName] = ref.split('.');
            if (!serviceId) {
                serviceId = this.main.id;
            }
            let serviceModule = this.main.modules.services[serviceId];
            if (!serviceModule || !serviceModule.sleds)
                return null;
            sled = serviceModule.sleds[sledName] || null;
        }
        else {
            sled = service.sleds[ref];
        }
        if (sled && sled.classOfSled)
            return sled;
        return null;
    }
    static run(params, options) {
        let sled = new this(params);
        return sled.run(options);
    }
    static runWithTransaction(params) {
        let sled = new this(params);
        return sled.runWithTransaction();
    }
    static get config() {
        let config = this._getConfig();
        if (!config) {
            throw new ReferenceError(`sled config not found [sled.${this.sledName}]`);
        }
        return config;
    }
    static _getConfig() {
        let { service, sledName } = this;
        if (typeof this._config === 'undefined') {
            this._config = service.config.get(`sled.${sledName}`, null);
        }
        return this._config;
    }
    static pre(fn) {
        if (!this._pre) {
            this._pre = [];
        }
        this._pre.push(fn);
        this._pre.sort(sortHooks);
    }
    static post(fn) {
        if (!this._post) {
            this._post = [];
        }
        this._post.push(fn);
        this._post.sort(sortHooks);
    }
    static async read(timeout) {
        let queue = this.createQueueDriver();
        let task = await queue.pop(timeout || 0);
        queue.free();
        if (!task) {
            return null;
        }
        let sled = new this();
        if (sled.fromJSON) {
            sled.fromJSON(task.params);
        }
        else {
            sled.params = task.params;
        }
        if (typeof task.result !== 'undefined') {
            sled.result = task.result;
        }
        else if (task.error) {
            sled.error = new Error(task.error);
        }
        sled.fromQueue = true;
        sled.task = task;
        return sled;
    }
    static createQueueDriver() {
        let { config, id, sledName } = this;
        if (!config.queue) {
            throw new ReferenceError(`sled queue config not found [sled.${sledName}.queue]`);
        }
        return this.service.createDriver(_.assign({ key: `queue:${id}` }, config.queue));
    }
    static createSubscribeDriver() {
        let { config, id, sledName } = this;
        if (!config.subscribe) {
            throw new ReferenceError(`sled subscribe config not found [sled.${sledName}.subscribe]`);
        }
        return this.service.createDriver(_.assign({ channel: `subscribe:${id}` }, config.subscribe));
    }
    static createLockDriver() {
        let { config, id, sledName } = this;
        if (!config.lock) {
            throw new ReferenceError(`sled lock config not found [sled.${sledName}.lock]`);
        }
        return this.service.createDriver(_.assign({ resource: `lock:${id}` }, config.lock));
    }
    get service() {
        return this.constructor.service;
    }
    get sledName() {
        return this.constructor.sledName || this.constructor.name;
    }
    get id() {
        return this.constructor.id;
    }
    get config() {
        return this.constructor.config;
    }
    async run(options) {
        options = options || {};
        if (this.error) {
            throw this.error;
        }
        if (typeof this.result !== 'undefined') {
            return this.result;
        }
        let lock = options.lock;
        if (typeof lock === 'undefined') {
            let config = this.constructor._getConfig();
            if (config && config.lock) {
                lock = true;
            }
        }
        let locker;
        if (lock) {
            locker = this.constructor.createLockDriver();
            await locker.lock();
        }
        if (typeof options.dbSession !== 'undefined') {
            this.dbSession = options.dbSession;
        }
        if (this.constructor._pre) {
            await collie.compose(this.constructor._pre, [], this);
        }
        if (typeof this.result !== 'undefined') {
            if (locker) {
                await locker.unlock();
                locker.free();
            }
            return this.result;
        }
        let result;
        try {
            result = await this.exec(this.params);
        }
        catch (error) {
            this.error = error;
            if (this.task && this.task.notify) {
                let subscribe = this.constructor.createSubscribeDriver();
                await subscribe.publish({ id: this.task.id, error: error.message });
                subscribe.free();
            }
            if (locker) {
                await locker.unlock();
                locker.free();
            }
            throw error;
        }
        this.result = result;
        if (this.constructor._post) {
            await collie.compose(this.constructor._post, [result], this);
        }
        if (this.task && this.task.notify) {
            let subscribe = this.constructor.createSubscribeDriver();
            await subscribe.publish({ id: this.task.id, result });
            subscribe.free();
        }
        if (locker) {
            await locker.unlock();
            locker.free();
        }
        return result;
    }
    async runWithTransaction() {
        let dbSession = await this.service.db.startSession();
        await dbSession.startTransaction();
        try {
            let result = await this.run({ dbSession });
            await dbSession.commitTransaction();
            return result;
        }
        catch (error) {
            await dbSession.abortTransaction();
            throw error;
        }
    }
    async send(timeout, notify) {
        if (typeof notify === 'undefined' && typeof timeout === 'boolean') {
            notify = timeout;
            timeout = 0;
        }
        if (this.result || this.error) {
            throw new Error('can not send a finished sled');
        }
        if (this.task) {
            return this.task;
        }
        timeout = timeout || 60 * 86400 * 1000;
        let { params, id, taskId } = this;
        if (this.toJSON) {
            params = this.toJSON();
        }
        if (!taskId) {
            taskId = `sled.${id}.${random(10)}`;
            this.taskId = taskId;
        }
        let task = {
            id: taskId,
            sled: id,
            sledName: this.sledName,
            notify: notify || false,
            params,
            result: undefined,
            error: undefined,
            timeout: timeout || 0,
            createdAt: new Date(),
            expiredAt: new Date(Date.now() + (timeout * 1000))
        };
        let queue = this.constructor.createQueueDriver();
        await queue.push(task);
        queue.free();
        return task;
    }
    async wait(waitTimeout, sledTimeout) {
        if (this.result) {
            return this.result;
        }
        if (this.error) {
            throw this.error;
        }
        if (!this.taskId) {
            this.taskId = `sled.${this.id}.${random(10)}`;
        }
        if (!this.task) {
            this.send(sledTimeout, true);
        }
        let start = Date.now();
        let subscribe = this.constructor.createSubscribeDriver();
        await subscribe.subscribe();
        while (true) {
            let timeout;
            if (waitTimeout) {
                timeout = waitTimeout - (Date.now() - start);
                if (timeout < 1)
                    timeout = 1;
            }
            let msg = await subscribe.read(timeout);
            if (msg && msg.id !== this.taskId)
                continue;
            await subscribe.cancel();
            subscribe.free();
            if (!msg)
                return null;
            if (typeof msg.result !== 'undefined') {
                this.result = msg.result;
            }
            else if (msg.error) {
                this.error = new Error(msg.error);
                throw this.error;
            }
            return this.result;
        }
    }
}
Sled.classOfSled = true;
exports.default = Sled;
