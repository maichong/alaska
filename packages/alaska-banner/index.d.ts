import { Service } from 'alaska';
import Banner from './models/Banner';

declare class BannerService extends Service {
  models: {
    Banner: typeof Banner;
  }
}

declare const bannerService: BannerService;

export default bannerService;
