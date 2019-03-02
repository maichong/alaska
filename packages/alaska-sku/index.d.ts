import { Service } from 'alaska';
import Sku from './models/Sku';
import { Image } from 'alaska-field-image';

declare module 'alaska-goods/models/Goods' {
  export interface GoodsFields {
    skus: Sku[];
  }
}

export class SkuService extends Service {
  models: {
    Sku: typeof Sku;
  };
}

declare const skuService: SkuService;

export default skuService;

export type Sku = Sku;
