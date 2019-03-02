export interface Goods {
  id: string;
  title: string;
  brief: string;
  pic: string;
  pics: string[];
  cat: string;
  brand: string;
  recommend: boolean;
  isHot: boolean;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  currency: string;
  price: number;
  discount: number;
  discountStartAt: string;
  discountEndAt: string;
  discountValid: boolean;
  shipping: number;
  inventory: number;
  volume: number;
  sort: number;
  activated: boolean;
  desc: string;
  createdAt: string;
}
