import { Model } from 'alaska-model';

export default class Email extends Model {
  static label = 'Email';
  static icon = 'envelope';
  static titleField = 'title';
  static defaultColumns = '_id title subject';
  static defaultSort = '-sort';
  static searchFields = 'title subject content';

  static actions = {
    test: {
      title: 'Test Send',
      sled: 'Test',
      style: 'success',
      depends: 'testTo'
    }
  };

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
    subject: {
      label: 'Subject',
      type: String
    },
    driver: {
      label: 'Driver',
      type: 'select',
      default: 'default',
      options: [] as any[]
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    testTo: {
      label: 'Test Send To',
      type: String,
      private: true
    },
    testData: {
      label: 'Test Template Variables',
      type: Object,
      private: true,
      default: {}
    },
    content: {
      label: 'Content',
      type: 'html'
    }
  };

  title: string;
  subject: string;
  driver: string;
  createdAt: Date;
  testTo: string;
  testData: any;
  content: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
