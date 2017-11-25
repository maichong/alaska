'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  let key = _alaska2.default.main.getConfig('autoLogin.key');
  let secret = _alaska2.default.main.getConfig('autoLogin.secret');
  let encryption;
  if (key && secret) {
    encryption = new _encryption2.default(secret);
  }

  return async function userMiddleware(ctx, next) {
    if (!ctx.session) return next();
    let userId = ctx.session.userId;

    // $Flow
    ctx.user = null;

    ctx.checkAbility = id => {
      if (!ctx.user) {
        ctx.status = 403;
        _alaska2.default.error('Access Denied', 403);
      }
      // $Flow ctx.user 一定存在
      return ctx.user.hasAbility(id).then(has => {
        if (!has) {
          ctx.status = 403;
          return Promise.reject(new _alaska.NormalError('Access Denied', 403));
        }
      });
    };
    if (userId) {
      try {
        // $Flow
        ctx.user = await _User2.default.findById(userId);
      } catch (e) {
        console.error(e.stack);
      }
    }

    if (!ctx.user && encryption) {
      let cookie = ctx.cookies.get(key);
      if (cookie) {
        try {
          let data = encryption.decrypt(Buffer.from(cookie, 'base64')).toString();
          if (data) {
            data = data.split(':').filter(d => d);
            if (data.length >= 2) {
              // $Flow
              let user = await _User2.default.findById(data[0]);
              if (!user) {
                throw new Error('user not found');
              }
              if (data[1] === encryption.hash(user.password)) {
                // $Flow
                ctx.user = user;
                ctx.session.userId = user.id;
              } else {
                ctx.cookies.set(key);
              }
            }
          } else {
            ctx.cookies.set(key);
          }
        } catch (error) {
          console.error(error.stack);
          ctx.cookies.set(key);
        }
      }
    }
    await next();
  };
};

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _User = require('../models/User');

var _User2 = _interopRequireDefault(_User);

var _encryption = require('../utils/encryption');

var _encryption2 = _interopRequireDefault(_encryption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }