import { Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Banner extends Model { }
interface Banner extends BannerFields { }

export interface BannerFields {
  title: string;
  pic: Image;
  place: string;
  action: string;
  url: string;
  sort: number;
  clicks: number;
  activated: boolean;
  startAt: Date;
  endAt: Date;
  createdAt: Date;

  isValid(): boolean;
}

export default Banner;
