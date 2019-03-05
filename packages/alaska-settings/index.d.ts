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

export class SettingsService extends Service {
  register(data: RegisterSettings): Promise<Settings>;
  getSync(id: string): any;
  get(id: string): Promise<any>;
  set(id: string, value: any): Promise<Settings>;
}

declare const settingsService: SettingsService;

export default settingsService;
