import { Model } from 'alaska-model';

declare class Banner extends Model {
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
}

export default Banner;
