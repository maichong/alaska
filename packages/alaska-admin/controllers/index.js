'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = async function (ctx) {
  if (!ctx.path.endsWith('/') && ctx.path.lastIndexOf('/') < 1) {
    ctx.redirect(ctx.path + '/');
    return;
  }
  await ctx.show('index', {
    prefix: ctx.service.getConfig('prefix'),
    env: process.env.NODE_ENV || 'production'
  });
};