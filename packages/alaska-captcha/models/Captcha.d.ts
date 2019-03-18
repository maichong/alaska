import { Model } from 'alaska-model';

declare class Captcha extends Model { }
interface Captcha extends CaptchaFields { }

export interface CaptchaFields {
  title: string;
  anonymous: boolean;
  userField: string;
  sms: string;
  email: string;
  type: string;
  characters: string;
  length: number;
  lifetime: number;
  createdAt: Date;
}

export default Captcha;
