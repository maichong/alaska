import { Service, Plugin } from 'alaska';
import Brand from './models/Brand';
import Goods from './models/Goods';

export class GoodsService extends Service {
  models: {
    Brand: typeof Brand;
    Goods: typeof Goods;
  }
}

declare const goodsService: GoodsService;

export default goodsService;
