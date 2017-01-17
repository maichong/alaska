// @flow

declare module 'alaska-page' {
  declare class PageService extends Alaska$Service {
  }
  declare var exports: PageService;
}
declare module 'alaska-page/models/Page' {
  declare class Page extends Alaska$Model {
    _id: string|number|Object|any;
    title: string;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    template: string;
    createdAt: Date;
    content: string;
    preSave():void;
  }
  declare var exports: Class<Page>;
}
