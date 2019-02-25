import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Shop extends Model { }
interface Shop extends ShopFields { }

export interface ShopFields {
  title: string;
  tel: string;
  logo: Image;
  user: RecordId;
  brand: RecordId;
  activated: boolean;
  createdAt: Date;
  desc: string;
}

export default Shop;
