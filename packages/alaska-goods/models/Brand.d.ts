import { Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Brand extends Model {
  title: string;
  brief: string;
  icon: Image;
  logo: Image;
  pic: Image;
  initial: string;
  sort: number;
  createdAt: Date;
  desc: string;
}

export default Brand;
