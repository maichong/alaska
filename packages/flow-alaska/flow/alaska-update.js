declare module 'alaska-update' {
  declare class UpdateService extends Alaska$Service {
    postInit(): void;
  }
  declare var exports: UpdateService;
}

declare module 'alaska-update/models/AppUpdate' {
  declare class AppUpdate extends Alaska$Model {
    key: string;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<AppUpdate>;
}
