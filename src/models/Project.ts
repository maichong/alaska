import { Model } from 'alaska-model';

export default class Project extends Model {
  static api = {
    list: 1,
    count: 1,
    show: 1
  };

  static groups = {
    test: {
      title: 'TestGroup',
      panel: true
    }
  }

  static relationships = {
    Order: {
      key: 'Order',
      ref: 'Order',
      path: 'project',
      private: true
    }
  }

  static fields = {
    title: {
      label: 'Title',
      type: 'text',
      index: true,
      required: true
    },
    status: {
      label: 'Status',
      type: 'select',
      required: true,
      number: true,
      options: [
        {
          label: 'Class-1',
          value: 1
        }, {
          label: 'Class-2',
          value: 2
        }]
    },
    fileSize: {
      label: 'Total file size',
      type: 'bytes',
      default: 0
    },
    cate: {
      ref: 'alaska-admin.AdminMenu',
      label: 'Category',
      type: 'category',
      multi: true,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      group: 'test',
      required: true
    },
    text: {
      type: 'text',
      label: 'Test',
      index: true,
      required: true,
      group: 'test'
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
  };

  title: string;
}
