declare module 'alaska-favorite' {
  declare class FavoriteService extends Alaska$Service {
  }
  declare var exports: FavoriteService;
}

declare module 'alaska-favorite/models/Favorite' {
  declare class Favorite extends Alaska$Model {
    title: string;
    pic: Object;
    user: Object;
    type: Object;
    target: string;
    createdAt: Date;
  }
  declare var exports: Class<Favorite>;
}
