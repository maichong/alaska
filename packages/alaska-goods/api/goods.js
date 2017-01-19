// @flow

import service from '../';
import Goods from '../models/Goods';

/**
 * 获取商品列表
 * @param ctx
 * @param next
 * @returns {*}
 */
export function list(ctx: Alaska$Context, next: Function): Function {
  let cid = ctx.query.cid || '';
  let filters: any = ctx.state.filters || ctx.query.filters || {};
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
export async function newest(ctx: Alaska$Context) {
  let cid: any = ctx.query.cid || service.error(400);
  const cache = service.cache;
  let cacheKey = `goods_newest_${cid}`;
  // $Flow 确认会得到Goods[]
  let results: ?Goods[] = await cache.get(cacheKey);
  if (!results) {
    // $Flow find
    results = await Goods.find({ activated: true, cats: cid }).sort('-createdAt').limit(10);
    // $Flow 自己写的Model类型描述不能继承Alaska$Model ? line 35
    results = results.map((goods: Goods) => (goods.data().omit('desc', 'pics', 'skus', 'cat')));
    cache.set(cacheKey, results, 600 * 1000);
  }
  ctx.body = results;
}

/**
 * 获取某个分类下的10个热销产品
 * @param ctx
 * @returns {Promise.<void>}
 */
export async function popular(ctx: Alaska$Context) {
  let cid: any = ctx.query.cid || service.error(400);
  const cache = service.cache;
  let cacheKey = `goods_popular_${cid}`;
  // $Flow 确认会得到Goods[]
  let results: ?Goods[] = await cache.get(cacheKey);
  if (!results) {
    // $Flow find
    results = await Goods.find({ activated: true, cats: cid }).sort('-volume -sort').limit(10);
    // $Flow 自己写的Model类型描述不能继承Alaska$Model ? line 55
    results = results.map((goods: Goods) => goods.data().omit('desc', 'pics', 'skus', 'cat'));
    cache.set(cacheKey, results, 600 * 1000);
  }
  ctx.body = results;
}
