import { Model } from 'alaska-model';

export default class Order extends Model {
  static label = 'Order';
  static icon = 'circle';
  static titleField = 'title';
  static preView = 'OrderPreview';
  static defaultColumns = 'image title user content state createdAt';
  static searchFields = 'title content';
  static defaultSort = '-createdAt';

  static api = {
    list: 1,
    count: 1,
    show: 1,
    watch: 1
  };

  static actions = {
    testAction: {
      title: 'Test',
      pages: ['list', 'editor']
    },
    activatedAction: {
      title: 'activatedAction',
      style: 'info',
      sled: 'test.BatchActivated',
      pages: ['list'],
      needRecords: 1
    },
    // unactivatedAction: {
    //   title: 'unactivatedAction',
    //   style: 'danger',
    //   sled: 'test.BatchUnActivated',
    //   pages:['list'],
    //   needRecords: 1
    // }
  };

  static fields = {
    title: {
      label: 'Title',
      type: 'text',
      index: true,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User'
    },
    content: {
      label: 'Content',
      type: 'text',
      ability: '*test.Order.update.content'
    },
    image: {
      label: 'Image',
      type: 'image-link'
    },
    state: {
      label: 'Order state',
      type: 'select',
      number: true,
      default: 0,
      options: [{
        label: 'Unpaid',
        value: 0
      }, {
        label: 'Paid',
        value: 1
      }]
    },
    project: {
      label: 'RelProject',
      type: 'relationship',
      ref: 'Project'
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: false
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
  };

  title: string;
  activated: boolean;
}
