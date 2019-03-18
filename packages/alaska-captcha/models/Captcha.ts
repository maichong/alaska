import { Model } from 'alaska-model';
import service from '..';

export default class Captcha extends Model {
  static label = 'Captcha';
  static icon = 'lock';
  static titleField = 'title';
  static defaultColumns = '_id title anonymous type length sms email lifetime';
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
    anonymous: {
      label: 'Anonymous',
      type: Boolean
    },
    userField: {
      label: 'User field',
      type: String,
      hidden: 'anonymous'
    },
    type: {
      label: 'Type',
      type: 'select',
      default: 'sms',
      options: [{
        label: 'SMS',
        value: 'sms',
        optional: 'alaska-sms'
      }, {
        label: 'Email',
        value: 'email',
        optional: 'alaska-sms'
      }]
    },
    sms: {
      label: 'SMS Template',
      type: 'relationship',
      ref: 'alaska-sms.Sms',
      optional: 'alaska-sms',
      hidden: {
        type: {
          $ne: 'sms'
        }
      }
    },
    email: {
      label: 'Email Template',
      type: 'relationship',
      ref: 'alaska-email.Email',
      optional: 'alaska-email',
      hidden: {
        type: {
          $ne: 'email'
        }
      }
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

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.type === 'sms' && !this.sms) service.error('Please select a sms template');
    if (this.type === 'email' && !this.email) service.error('Please select a email template');
    if (!this.anonymous && !this.userField) service.error('userField is required');
  }
}
