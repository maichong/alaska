import { Model } from 'alaska-model';

declare class Goods extends Model {
  title: string;
  brief: string;
  pic: Object;
  pics: Object[];
  cat: Object;
  cats: Object[];
  brand: Object;
  newGoods: boolean;
  hotGoods: boolean;
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
