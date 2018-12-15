import { Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Category extends Model {
  title: string;
  icon: Image;
  pic: Image;
  desc: string;
  parent: Object;
  parents: Object[];
  children: Object[];
  activated: boolean;
  sort: number;
  createdAt: Date;
}

export default Category;
