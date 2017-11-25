// @flow

declare module 'alaska-help' {
  declare class HelpService extends Alaska$Service {
  }

  declare var exports: HelpService;
}
declare module 'alaska-help/models/Help' {
  declare class Help extends Alaska$Model {
    title: string;
    parent: Object;
    relations: Object[];
    sort: number;
    activated: boolean;
    createdAt: Date;
    content: string;
    preSave(): void;
  }

  declare var exports: Class<Help>;
}
