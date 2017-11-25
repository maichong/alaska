declare module 'alaska-banner' {
  declare class BannerService extends Alaska$Service {
  }

  declare var exports: BannerService;
}
declare module 'alaska-banner/models/Banner' {
  declare class Banner extends Alaska$Model {
    title: string;
    pic: Object;
    position: string;
    action: string;
    url: string;
    sort: number;
    clicks: number;
    activated: boolean;
    startAt: Date;
    endAt: Date;
    createdAt: Date;
    preSave(): void;
    isValid(): boolean;
  }

  declare var exports: Class<Banner>;
}
