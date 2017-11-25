import Brand from 'alaska-goods/models/Brand';

declare module 'alaska-shop' {
  declare class ShopService extends Alaska$Service {
  }

  declare var exports: ShopService;
}

declare module 'alaska-shop/models/Shop' {
  declare class Shop extends Alaska$Model {
    title: string;
    logo: Object;
    user: User;
    brand: Brand;
    activated: boolean;
    createdAt: Date;
    desc: string;
  }

  declare var exports: Class<Shop>;
}
