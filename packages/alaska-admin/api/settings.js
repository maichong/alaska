'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getLogo(key) {
  let logo = '';
  let pic = await _alaskaSettings2.default.get(key);

  if (pic && pic.url) {
    logo = pic.url;
  }
  return logo;
}

exports.default = async function (ctx) {
  let user = ctx.user;
  const loginLogo = await getLogo('adminLoginLogo');
  const logo = await getLogo('adminLogo');
  const icon = await getLogo('adminIcon');

  if (!user) {
    ctx.body = {
      locales: {
        'alaska-admin': _2.default.locales
      },
      locale: ctx.locale,
      loginLogo,
      logo,
      icon,
      user: {}
    };
    return;
  }

  ctx.session.lastAlive = Date.now();
  let access = await user.hasAbility('admin');
  let settings = {};

  if (access) {
    settings = await _2.default.settings(ctx, user);
  } else {
    settings.locales = {
      'alaska-admin': _2.default.locales
    };
  }

  settings.locale = ctx.locale;
  settings.logo = logo;
  settings.icon = icon;
  settings.user = Object.assign({ access }, user.data());
  ctx.body = settings;
};