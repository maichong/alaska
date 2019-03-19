import { Service } from 'alaska';
import { Model } from 'alaska-model';

class FavoriteService extends Service {
  types: Map<string, typeof Model>;

  preInit() {
    this.types = new Map();

    let model = Model.lookup('alaska-goods.Goods');
    model && this.types.set('goods', model);

    model = Model.lookup('alaska-shop.Shop');
    model && this.types.set('shop', model);

    model = Model.lookup('alaska-brand.Brand');
    model && this.types.set('brand', model);

    model = Model.lookup('alaska-post.Post');
    model && this.types.set('post', model);
  }
}

export default new FavoriteService({
  id: 'alaska-favorite'
});
