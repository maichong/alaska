import { Model } from 'alaska-model';

declare class AppUpdate extends Model { }
interface AppUpdate extends AppUpdateFields { }

export interface AppUpdateFields {
  title: string;
  service: string;
  createdAt: Date;
}

export default AppUpdate;
