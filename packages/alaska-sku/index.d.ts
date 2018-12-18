import { Service } from 'alaska';
import { PropData } from 'alaska-property';
import Sku from './models/Sku';
import { Image } from 'alaska-field-image';

declare module 'alaska-goods/models/Goods' {
}

declare class SkuService extends Service {
  models: {
    Sku: typeof Sku;
  };
}

declare const skuService: SkuService;

export default skuService;

export interface SkuData {
  id: string;
  key: string;
  pic: Image;
  goods: string;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  valid: boolean;
  props: PropData[];
}
