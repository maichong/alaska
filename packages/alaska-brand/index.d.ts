import { Service } from 'alaska';
import Brand from './models/Brand';

export class BrandService extends Service {
  models: {
    Brand: typeof Brand;
  }
}

declare const brandService: BrandService;

export default brandService;
