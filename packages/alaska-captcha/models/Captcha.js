// @flow

import alaska, { Model } from 'alaska';
import service from '../';

const SMS = alaska.service('alaska-sms', true);
const EMAIL = alaska.service('alaska-email', true);

const options = [];
const fields = {};
if (SMS) {
  options.push({
    label: 'SMS',
    value: 'sms'
  });
  fields.sms = {
    label: 'SMS Template',
    ref: 'alaska-sms.Sms',
    depends: {
      type: 'sms'
    }
  };
}

if (EMAIL) {
  options.push({
    label: 'Email',
    value: 'email'
  });
  fields.email = {
    label: 'Email Template',
    ref: 'alaska-email.Email',
    depends: {
      type: 'email'
    }
  };
}

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
      options,
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
    },
    ...fields
  };

  _id: string|number|Object|any;
  title: string;
  type: string;
  numbers: string;
  letters: string;
  length: number;
  lifetime: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.type === 'sms' && !this.sms) service.error('Please select a sms template');
    if (this.type === 'email' && !this.email) service.error('Please select a email template');
  }
}
