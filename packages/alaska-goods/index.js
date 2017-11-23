// @flow

import alaska, { Service } from 'alaska';

/**
 * @class GoodsService
 */
class GoodsService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-goods';
    super(options);
  }

  /**
   * 获取商品分类列表
   */
  async cats() {
    let cache = this.cache;
    let data = await cache.get('goods_cats');
    if (data) {
      return data;
    }
    const GoodsCat = this.getModel('GoodsCat');
    let map = {};
    // $Flow
    let cats = await GoodsCat.find().sort('-sort');
    cats = cats.map((cat) => {
      let c = cat.data();
      c.subs = [];
      map[c.id] = c;
      return c;
    });
    cats.forEach((c) => {
      if (c.parent && map[c.parent]) {
        map[c.parent].subs.push(c);
      }
    });
    cats = cats.filter((c) => {
      let res = !c.parent;
      delete c.parent;
      if (!c.subs.length) {
        delete c.subs;
      }
      return res;
    });
    cache.set(cats);
    return cats;
  }

  _clearCacheTimer: ?number;

  clearCache() {
    if (!this._clearCacheTimer) {
      this._clearCacheTimer = setTimeout(() => {
        let cache = this.cache;
        this._clearCacheTimer = 0;
        cache.del('goods_cats');
      }, 5);
    }
  }
}

export default new GoodsService();
