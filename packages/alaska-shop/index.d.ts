import { Service } from 'alaska';
import { PropData } from 'alaska-property';
import Shop from './models/Shop';
import { Image } from 'alaska-field-image';

export class ShopService extends Service {
  models: {
    Shop: typeof Shop;
  };
}

declare const shopService: ShopService;

export default shopService;

export type Shop = Shop;

export interface ShopItem {
  pic: string;
  action: string;
  url: string;
  height: number;
  width: number;
}
