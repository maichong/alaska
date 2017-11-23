// @flow

import alaska, { Model } from 'alaska';
import service from '../';

export default class Sms extends Model {
  static label = 'SMS';
  static icon = 'comment';
  static titleField = 'title';
  static defaultColumns = '_id title content createdAt';
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
    driver: {
      label: 'Driver',
      type: 'select',
      options: service.getDriverOptionsAsync()
    },
    content: {
      label: 'Content',
      type: String,
      required: true,
      multiLine: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  static preRegister() {
    let locales = alaska.main.getConfig('locales');

    if (locales && locales.length > 1) {
      let SmsModel: Class<Alaska$Model> = Sms;
      SmsModel.fields.content.help = 'Default';
      locales.forEach((locale) => {
        SmsModel.fields['content_' + locale.replace('-', '_')] = {
          label: 'Content',
          type: String,
          multiLine: true,
          help: service.t('lang', locale)
        };
      });
    }
  }

  _id: string | number | Object | any;
  title: string;
  driver: Object;
  content: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}

