import { Model } from 'alaska-model';

declare class AppUpdate extends Model {
  _id: string;
  title: string;
  service: string;
  createdAt: Date;
}

export default AppUpdate;
