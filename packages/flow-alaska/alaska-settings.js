
declare module 'alaska-settings' {
  declare class SettingsService extends Alaska$Service {
    register(data: Object):Settings;
    get(id: string|number):any;
    set(id: string|number, value: any):any;
  }
  declare var exports: SettingsService;
}

declare class Settings extends Alaska$Model {
  title: string;
  service: string;
  group: string;
  value: Object;
  help: string;
  type: string;
  super: boolean;
  options: Object;
}
declare module 'alaska-settings/models/Settings' {

  declare var exports: Class<Settings>;
}