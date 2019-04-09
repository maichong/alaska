"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random = require("string-random");
const pathToRegexp = require("path-to-regexp");
const session_1 = require("./session");
function default_1(options, main) {
    const storeOpts = options.store;
    if (!storeOpts)
        throw new Error('Missing config [/middlewares.alaska-middleware-session.store]');
    const cookieOpts = options.cookie || {};
    const key = cookieOpts.key || 'alaska.sid';
    const Store = main.modules.libraries[storeOpts.type];
    if (!Store)
        throw new Error(`Session store driver '${storeOpts.type}' not found!`);
    const store = new Store(storeOpts, main);
    let ignore = null;
    function convert(input) {
        if (typeof input === 'string') {
            ignore.push(pathToRegexp(input));
        }
        else if (input instanceof RegExp || typeof input === 'function') {
            ignore.push(input);
        }
        else {
            throw new Error(`Invalid session ignore option: ${String(input)}`);
        }
    }
    if (options.ignore) {
        ignore = [];
        if (Array.isArray(options.ignore)) {
            options.ignore.forEach(convert);
        }
        else {
            convert(options.ignore);
        }
    }
    return async function sessionMiddleware(ctx, next) {
        if (ignore) {
            for (let reg of ignore) {
                if ((reg instanceof RegExp && reg.test(ctx.path))
                    || (typeof reg === 'function' && reg(ctx.path, ctx))) {
                    await next();
                    return;
                }
            }
        }
        ctx.sessionKey = key;
        let sid = '';
        if (cookieOpts && options.getSessionId) {
            ctx.sessionId = options.getSessionId(ctx, key, cookieOpts);
            sid = ctx.sessionId;
        }
        else {
            ctx.sessionId = ctx.cookies.get(key, cookieOpts);
            sid = ctx.sessionId;
        }
        let json;
        let session;
        if (sid) {
            json = await store.get(sid);
        }
        else {
            ctx.sessionId = random(24);
            sid = ctx.sessionId;
            if (cookieOpts && options.setSessionId) {
                options.setSessionId(ctx, key, sid, cookieOpts);
            }
            else {
                ctx.cookies.set(key, sid, cookieOpts);
            }
        }
        if (json) {
            ctx.sessionId = sid;
            try {
                session = new session_1.default(ctx, json);
            }
            catch (err) {
                if (!(err instanceof SyntaxError)) {
                    throw err;
                }
                session = new session_1.default(ctx, {});
            }
        }
        else {
            session = new session_1.default(ctx, {});
        }
        Object.defineProperty(ctx, 'session', {
            get() {
                if (session)
                    return session;
                if (session === false)
                    return null;
                return null;
            },
            set(val) {
                if (val === null) {
                    session = false;
                    return;
                }
                if (typeof val === 'object') {
                    session = new session_1.default(ctx, val);
                    return;
                }
                throw new Error('ctx.session can only be set as null or an object.');
            }
        });
        let jsonString = JSON.stringify(json);
        function onNext() {
            if (session === false) {
                if (cookieOpts && options.setSessionId) {
                    options.setSessionId(ctx, key, '', cookieOpts);
                }
                else {
                    ctx.cookies.set(key, '', cookieOpts);
                }
                store.del(sid);
            }
            else if (!json && !session.length) {
            }
            else if (session.isChanged(jsonString)) {
                json = session.toJSON();
                store.set(sid, json);
            }
        }
        try {
            await next();
            onNext();
        }
        catch (error) {
            onNext();
            throw error;
        }
    };
}
exports.default = default_1;
