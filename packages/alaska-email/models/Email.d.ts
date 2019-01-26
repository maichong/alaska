import { Model } from 'alaska-model';

declare class Email extends Model { }
interface Email extends EmailFields { }

export interface EmailFields {
  title: string;
  subject: string;
  driver: string;
  createdAt: Date;
  testTo: string;
  testData: any;
  content: string;
}

export default Email;
