import { Model } from 'alaska-model';

declare class Captcha extends Model {
  _id: string | number | Object | any;
  title: string;
  type: string;
  numbers: string;
  letters: string;
  length: number;
  lifetime: number;
  createdAt: Date;
  sms: string;
  email: string;
}

export default Captcha;
