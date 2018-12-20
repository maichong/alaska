import { Model } from 'alaska-model';
import service from '..';

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

  _id: string;
  title: string;
  driver: string;
  content: string;
  createdAt: Date;

  static preRegister() {
    let locales = service.main.config.get('locales');

    if (locales && locales.length > 1) {
      let SmsModel: typeof Model = Sms;
      SmsModel.fields.content.help = 'Default';
      locales.forEach((locale: string) => {
        SmsModel.fields[`content_${locale.replace('-', '_')}`] = {
          label: 'Content',
          type: String,
          // help: service.t('lang', locale)
        };
      });
    }
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
