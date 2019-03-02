import { RecordId, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Category extends Model { }
interface Category extends CategoryFields { }

export interface CategoryFields {
  title: string;
  icon: Image;
  pic: Image;
  desc: string;
  group: string;
  parent: RecordId;
  parents: RecordId[];
  children: RecordId[];
  activated: boolean;
  sort: number;
  createdAt: Date;
}

export default Category;
