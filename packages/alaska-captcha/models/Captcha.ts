import { Model } from 'alaska-model';
import service from '..';

export default class Captcha extends Model {
  static label = 'Captcha';
  static icon = 'lock';
  static titleField = 'title';
  static defaultColumns = '_id title type length sms email';
  static defaultSort = '_id';

  static fields = {
    _id: {
      type: String,
      required: true
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    type: {
      label: 'Type',
      type: 'select',
      default: 'sms',
      options: [] as Array<{ label: string; value: string }>,
    },
    characters: {
      label: 'Characters',
      type: String,
      default: '0123456789ABCDEFGHJKMNPQRSTWXYZ'
    },
    length: {
      label: 'Length',
      type: Number,
      default: 6
    },
    lifetime: {
      label: 'Life Time',
      type: Number,
      default: 1800,
      addonAfter: 'seconds'
    }
  };

  _id: string | number | Object | any;
  title: string;
  type: string;
  characters: string;
  length: number;
  lifetime: number;
  createdAt: Date;
  sms: string;
  email: string;

  static preRegister() {
    if (this.main.allServices.get('alaska-sms')) {
      this.fields.type.options.push({
        label: 'SMS',
        value: 'sms'
      });
      // @ts-ignore 动态加载
      if (!this.fields.sms) {
        // @ts-ignore 动态加载
        this.fields.sms = {
          label: 'SMS Template',
          type: 'relationship',
          ref: 'alaska-sms.Sms',
          depends: {
            type: 'sms'
          }
        };
      }
    }

    if (this.main.allServices.get('alaska-email')) {
      this.fields.type.options.push({
        label: 'Email',
        value: 'email'
      });
      // @ts-ignore 动态加载
      if (!this.fields.email) {
        // @ts-ignore 动态加载
        this.fields.email = {
          label: 'Email Template',
          type: 'relationship',
          ref: 'alaska-email.Email',
          depends: {
            type: 'email'
          }
        };
      }
    }
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.type === 'sms' && !this.sms) service.error('Please select a sms template');
    if (this.type === 'email' && !this.email) service.error('Please select a email template');
  }
}
