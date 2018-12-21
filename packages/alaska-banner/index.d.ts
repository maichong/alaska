import { Service } from 'alaska';
import Banner from './models/Banner';

export class BannerService extends Service {
  models: {
    Banner: typeof Banner;
  }
}

declare const bannerService: BannerService;

export default bannerService;
