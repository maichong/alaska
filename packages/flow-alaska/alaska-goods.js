declare module 'alaska-goods/models/Brand' {
  declare class Brand extends Alaska$Model {
    title:string;
    brief:string;
    icon:Object;
    logo:Object;
    pic:Object;
    initial:string;
    sort:number;
    createdAt:Date;
    desc:string;
    preSave():void;
  }
  declare var exports: Class<Brand>;
}

declare module 'alaska-goods/models/Goods' {
  declare class Goods extends Alaska$Model {
    title:string;
    brief:string;
    pic:Object;
    pics:Object[];
    cats:Object[];
    brand:Object;
    newGoods:boolean;
    hotGoods:boolean;
    seoTitle:string;
    seoKeywords:string;
    seoDescription:string;
    currency:any;
    price:number;
    discount:number;
    discountStartAt:Date;
    discountEndAt:Date;
    shipping:number;
    inventory:number;
    volume:number;
    sort:number;
    activated:boolean;
    props:Object;
    propValues:Object[];
    skus:Object[];
    sku:Object;
    createdAt:Date;
    desc:string;
    preSave():void;
  }
  declare var exports: Class<Goods>;
}

declare module 'alaska-goods/models/GoodsCat' {
  declare class GoodsCat extends Alaska$Model {
    title:string;
    icon:Object;
    pic:Object;
    desc:string;
    parent:Object;
    subCats:Object;
    sort:number;
    createdAt:Date;
    preSave():void;
    postSave():void;
    postRemove():void;
    subs():any;
    allSubs():Object;
    parents():Object[];
  }
  declare var exports: Class<GoodsCat>;
}

declare module 'alaska-goods/models/GoodsProp' {
  declare class GoodsProp extends Alaska$Model {
    title:string;
    cats:Object;
    catsIndex:any;
    common:boolean;
    required:boolean;
    multi:boolean;
    sku:boolean;
    filter:boolean;
    input:boolean;
    checkbox:boolean;
    switch:boolean;
    sort:number;
    help:string;
    values:Object[];
    activated:boolean;
    createdAt:Date;
    valueEditor:string;
    preSave():void;
    preRemove():void;
    updateCatsIndex():void;
  }
  declare var exports: Class<GoodsProp>;
}

declare module 'alaska-goods/models/GoodsPropValue' {
  declare class GoodsPropValue extends Alaska$Model {
    title: string;
    prop:Object;
    cats:Object;
    catsIndex:any;
    common:boolean;
    sort:number;
    createdAt:Date;
    preSave():void;
    postSave():void;
    postRemove():void;
    processProp():void;
    updateCatsIndex():void;
  }
  declare var exports: Class<GoodsPropValue>;
}

declare module 'alaska-goods/models/Sku' {
  declare class Sku extends Alaska$Model {
    pic: Object;
    goods: Object;
    key: string;
    desc: string;
    price: number;
    discount: number;
    inventory: number;
    volume: number;
    valid: boolean;
    props: Object;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<Sku>;
}

declare module 'alaska-goods/models/Special' {
  declare class Special extends Alaska$Model {
    title: string;
    pic: Object;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    goods: Object[];
    createdAt: Date;
    desc: string;
    preSave():void;
  }
  declare var exports: Class<Special>;
}

declare module 'alaska-goods/sleds/UpdatePropRef' {
  declare class UpdatePropRef extends Alaska$Sled {
  }
  declare var exports: Class<UpdatePropRef>;
}

declare module 'alaska-goods/sleds/UpdateatRef' {
  declare class UpdateCatRef extends Alaska$Sled {
  }
  declare var exports: Class<UpdateCatRef>;
}

