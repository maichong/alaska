declare module 'alaska-menu' {
 declare class MenuService extends Alaska$Service {
 }
 declare var exports:MenuService;
}
declare module 'alaska-menu/models/Menu' {
  declare class Menu extends Alaska$Model {
    _id:String|number|Object|any;
    title:string;
    items:Object;
    createdAt:Date;
  }
  declare var exports: Class<Menu>;
}