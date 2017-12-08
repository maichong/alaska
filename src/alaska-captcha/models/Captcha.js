// @flow

import alaska, { Model } from 'alaska';
import service from '../';

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
      options: [],
    },
    numbers: {
      label: 'Numbers',
      type: String,
      default: '0123456789'
    },
    letters: {
      label: 'Letters',
      type: String,
      default: 'ABCDEFGHJKMNPQRSTWXYZ'
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
  numbers: string;
  letters: string;
  length: number;
  lifetime: number;
  createdAt: Date;
  sms: string;
  email: string;

  static preRegister() {
    if (alaska.hasService('alaska-sms')) {
      // $Flow
      this.fields.type.options.push({
        label: 'SMS',
        value: 'sms'
      });
      if (!this.fields.sms) {
        // $Flow
        this.fields.sms = {
          label: 'SMS Template',
          ref: 'alaska-sms.Sms',
          depends: {
            type: 'sms'
          }
        };
      }
    }

    if (alaska.hasService('alaska-email')) {
      // $Flow
      this.fields.type.options.push({
        label: 'Email',
        value: 'email'
      });
      if (!this.fields.email) {
        // $Flow
        this.fields.email = {
          label: 'Email Template',
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
