import Goods from 'alaska-goods/models/Goods';
import Sku from 'alaska-goods/models/Sku';

declare module 'alaska-order' {
  declare class OrderService extends Alaska$Service {
  }

  declare var exports: OrderService;
}
declare class Alaska$Model$Order extends Alaska$Model {
  title: string;
  user: User;
  type:any;
  pic:Object;
  items:Alaska$Model$OrderItem[];
  address:Object;
  currency:string;
  shipping:number;
  total:number;
  pay:number;
  payed:number;
  payment:string;
  refund:number;
  refundReason:string;
  refundAmount:number;
  shipped:boolean;
  state:number;
  failure:string;
  createdAt:Date;
  paymentTimeout:Date;
  receiveTimeout:Date;
  refundTimeout:Date;
  userDeleted:boolean;
  adminDeleted:boolean;

  _logTotal:Alaska$Model$OrderLog;
  _logShipping:Alaska$Model$OrderLog;

  createLog():Alaska$Model$OrderLog;
  canAppendItem():boolean;
}

declare module 'alaska-order/models/Order' {

  declare var exports: Class<Alaska$Model$Order>;
}

declare class Alaska$Model$OrderItem extends Alaska$Model {
  pic:Object;
  title:string;
  order:Alaska$Model$Order;
  goods:Goods;
  sku:Sku;
  skuDesc:string;
  currency:string;
  price:number;
  discount:number;
  quantity:number;
  shipping:number;
  total:number;
  createdAt:Date;
}
declare module 'alaska-order/models/OrderItem' {

  declare var exports: Class<Alaska$Model$OrderItem>;
}

declare class Alaska$Model$OrderLog extends Alaska$Model {
  title:string;
  order:Alaska$Model$Order;
  state:number;
  createdAt:Date;
}

declare module 'alaska-order/models/OrderLog' {

  declare var exports: Class<Alaska$Model$OrderLog>;
}
