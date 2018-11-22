import { Service } from 'alaska';
import Settings from './models/Settings';

export interface RegisterSettings {
  id: string;
  title: string;
  service: string;
  group?: string;
  value?: any;
  help?: string;
  type: string;
  super?: boolean;
  options?: any;
}

declare class SettingsService extends Service {
  register(data: RegisterSettings): Promise<Settings>;
  get(id: string): Promise<any>;
  set(id: string, value: any): Promise<Settings>;
}

declare const settingsService: SettingsService;

export default settingsService;
