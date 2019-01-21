import { Service, Plugin } from 'alaska';
import Goods from './models/Goods';

export class GoodsService extends Service {
  models: {
    Goods: typeof Goods;
  }
}

declare const goodsService: GoodsService;

export default goodsService;
