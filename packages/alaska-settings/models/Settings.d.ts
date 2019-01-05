import { Model } from 'alaska-model';

declare class Settings extends Model { }
interface Settings extends SettingsFields { }

export interface SettingsFields {
}

declare interface Settings {
  _id: string;
  id: string;
  title: string;
  service: string;
  group: string;
  value: any;
  help: string;
  type: string;
  super: boolean;
  options: any;
}

export default Settings;
