import Goods from 'alaska-goods/models/Goods';
import Sku from 'alaska-goods/models/Sku';

declare module 'alaska-cart' {
  declare class CartService extends Alaska$Service {
  }

  declare var exports: CartService;
}

declare module 'alaska-cart/models/CartItem' {
  declare class CartItem extends Alaska$Model {
    pic: Object;
    title: string;
    goods: Goods;
    sku: Sku;
    skuDesc: string;
    user: User;
    currency: string;
    price: number;
    discount: number;
    quantity: number;
    createdAt: Date;
  }

  declare var exports: Class<CartItem>;
}
