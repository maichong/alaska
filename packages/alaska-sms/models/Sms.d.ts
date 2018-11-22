import { Model } from 'alaska-model';

declare class Sms extends Model {
  _id: string;
  title: string;
  driver: string;
  content: string;
  createdAt: Date;
}

export default Sms;
