import { Model } from 'alaska-model';

declare class Sms extends Model { }
interface Sms extends SmsFields { }

export interface SmsFields {
  title: string;
  driver: string;
  content: string;
  createdAt: Date;
}

export default Sms;
