import { Model } from 'alaska-model';

declare class Banner extends Model { }
interface Banner extends BannerFields { }

export interface BannerFields {
  title: string;
  pic: Object;
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
