import * as mongodb from 'mongodb';
import { RecordId, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Goods extends Model {
  /**
   * 增加商品库存，如果增加成功，返回新的商品记录，否则返回null
   * @param id 商品ID
   * @param quantity 增加数量
   */
  static incInventory(id: RecordId, quantity: number, dbSession?: mongodb.ClientSession): Promise<Goods | null>;

  /**
   * 增加商品销量，如果增加成功，返回新的商品记录，否则返回null
   * @param id 商品ID
   * @param quantity 增加数量
   */
  static incVolume(id: RecordId, quantity: number, dbSession?: mongodb.ClientSession): Promise<Goods | null>;
}
interface Goods extends GoodsFields { }

export interface GoodsFields {

  title: string;
  brief: string;
  pic: Image;
  pics: Image[];
  cat: RecordId;
  cats: RecordId[];
  brand: RecordId;
  recommend: boolean;
  isHot: boolean;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  currency: any;
  price: number;
  discount: number;
  discountStartAt: Date;
  discountEndAt: Date;
  shipping: number;
  inventory: number;
  volume: number;
  sort: number;
  activated: boolean;
  desc: string;
  createdAt: Date;
}

export default Goods;
