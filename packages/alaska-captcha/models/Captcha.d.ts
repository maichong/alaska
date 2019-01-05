import { Model } from 'alaska-model';

declare class Captcha extends Model { }
interface Captcha extends CaptchaFields { }

export interface CaptchaFields {
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
