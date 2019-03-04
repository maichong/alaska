import { PropData } from 'alaska-property/types';

export interface Sku {
  id: string;
  key: string;
  pic: string;
  goods: string;
  shop: string;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  props: PropData[];
  createdAt: string;
}

declare module 'alaska-goods/types' {
  export interface Goods {
    skus: Sku[];
  }
}
