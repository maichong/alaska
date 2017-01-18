declare module 'alaska-update' {
  declare class updateService extends Alaska$Service {
  constructor(options?:Alaska$Service$options, alaska?:Alaska$Alaska):void;
  }
  declare var exports:updateService;
}

declare module 'alaska-update/models/AppUpdate' {
  declare class AppUpdate extends Alaska$Model {
  key: string;
  createdAt: Date;
  }
  declare var exports:Class<AppUpdate>;
}
