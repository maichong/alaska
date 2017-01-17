declare module 'alaska-link' {
  declare class LinkService extends Alaska$Service {

  }
  declare var exports: LinkService;
}
declare module 'alaska-link/models/Link' {
  declare class Link extends Alaska$Model {
    title:string;
    url:string;
    pic:Object;
    activated:boolean;
    sort:number;
    createdAt:Date;
  }
  declare var exports: Class<Link>;
}