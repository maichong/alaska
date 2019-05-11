"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const User_1 = require("alaska-user/models/User");
const Login_1 = require("alaska-user/sleds/Login");
const encryption_1 = require("alaska-user/encryption");
function default_1(config, main) {
    let key = main.config.get('autoLogin.key');
    let secret = main.config.get('autoLogin.secret');
    let encryption;
    if (key && secret) {
        encryption = new encryption_1.default(secret);
    }
    return async function userMiddleware(ctx, next) {
        if (!ctx.session || ctx.user) {
            await next();
            return;
        }
        let userId = ctx.session.userId;
        let password = ctx.session.password;
        ctx.user = null;
        if (userId) {
            try {
                let user = await User_1.default.findById(userId);
                if (user && user.password !== password) {
                    user = null;
                    delete ctx.session.userId;
                    delete ctx.session.password;
                }
                ctx.user = user;
            }
            catch (e) {
                console.error(e.stack);
            }
        }
        if (!ctx.user && encryption) {
            let cookie = ctx.cookies.get(key);
            if (cookie) {
                try {
                    let data = encryption.decrypt(Buffer.from(cookie, 'base64')).toString();
                    if (data) {
                        let arr = data.split(':').filter((d) => d);
                        if (arr.length >= 2) {
                            let user = await User_1.default.findById(arr[0]);
                            if (!user) {
                                throw new Error('user not found');
                            }
                            if (arr[1] === encryption.hash(user.password)) {
                                ctx.user = user;
                                ctx.session.userId = user._id.toString();
                                ctx.session.password = user.password;
                            }
                            else {
                                ctx.cookies.set(key);
                            }
                        }
                    }
                    else {
                        ctx.cookies.set(key);
                    }
                }
                catch (error) {
                    console.error(error.stack);
                    ctx.cookies.set(key);
                }
            }
        }
        if (!ctx.user && config.enableBasicAuth && ctx.headers.authorization) {
            try {
                let [type, code] = ctx.headers.authorization.split(' ');
                if (type === 'Basic' && code) {
                    code = Buffer.from(code, 'base64').toString() || '';
                    let index = code.indexOf(':');
                    let username = code.substr(0, index);
                    let password = code.substr(index + 1);
                    ctx.user = await Login_1.default.run({ username, password, remember: false, channel: 'basic-auth' }, { dbSession: ctx.dbSession });
                }
                else {
                    throw new Error('invalid authorization');
                }
            }
            catch (error) {
                throw new alaska_1.NormalError('Base Auth Field', 401);
            }
        }
        await next();
    };
}
exports.default = default_1;
