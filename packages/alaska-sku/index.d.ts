import { Service } from 'alaska';
import Sku from './models/Sku';

declare class SkuService extends Service {
  models: {
    Sku: typeof Sku;
  };
  sleds: {
  }
}

declare const skuService: SkuService;

export default skuService;
