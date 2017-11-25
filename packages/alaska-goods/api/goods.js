'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = list;
exports.newest = newest;
exports.popular = popular;

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Goods = require('../models/Goods');

var _Goods2 = _interopRequireDefault(_Goods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 获取商品列表
 * @param ctx
 * @param next
 * @returns {*}
 */
function list(ctx, next) {
  let cid = ctx.query.cid || '';
  let filters = ctx.state.filters || ctx.query.filters || {};
  if (cid) {
    filters.cats = cid;
  }
  ctx.state.filters = filters;
  return next();
}

/**
 * 获取某个分类下的10个最新产品
 * @param ctx
 * @returns {Promise.<void>}
 */
async function newest(ctx) {
  let cid = ctx.query.cid || _2.default.error(400);
  const { cache } = _2.default;
  let cacheKey = `goods_newest_${cid}`;
  let results = await cache.get(cacheKey);
  if (!results) {
    // $Flow find
    let mResults = await _Goods2.default.find({ activated: true, cats: cid }).sort('-createdAt').limit(10);
    // $Flow
    results = mResults.map(goods => goods.data().omit('desc', 'pics', 'skus', 'cat'));
    cache.set(cacheKey, results, 600 * 1000);
  }
  ctx.body = results;
}

/**
 * 获取某个分类下的10个热销产品
 * @param ctx
 * @returns {Promise.<void>}
 */
async function popular(ctx) {
  let cid = ctx.query.cid || _2.default.error(400);
  const { cache } = _2.default;
  let cacheKey = `goods_popular_${cid}`;
  let results = await cache.get(cacheKey);
  if (!results) {
    // $Flow find
    let mResults = await _Goods2.default.find({ activated: true, cats: cid }).sort('-volume -sort').limit(10);
    // $Flow
    results = mResults.map(goods => goods.data().omit('desc', 'pics', 'skus', 'cat'));
    cache.set(cacheKey, results, 600 * 1000);
  }
  ctx.body = results;
}