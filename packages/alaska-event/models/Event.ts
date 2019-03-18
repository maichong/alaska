import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

export default class Event extends Model {
  static label = 'Event';
  static icon = 'bell';
  static titleField = 'title';
  static searchFields = 'title';
  static defaultColumns = 'pic title user type top parent read createdAt';
  static filterFields = 'top user from type createdAt?range';
  static defaultSort = '-createdAt';

  static populations = {
    from: {
      select: ':tiny'
    }
  };

  static api = {
    list: 3,
    count: 3,
    paginate: 3,
    show: 3,
    remove: 3
  };

  static fields = {
    pic: {
      label: 'Picture',
      type: 'image'
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      index: true,
      required: true
    },
    from: {
      label: 'From',
      type: 'relationship',
      ref: 'alaska-user.User'
    },
    type: {
      label: 'Type',
      type: 'select',
      default: '',
      options: [{
        label: 'Default',
        value: ''
      }]
    },
    level: {
      label: 'Level',
      type: 'select',
      number: true,
      checkbox: true,
      default: 0,
      options: [{
        label: 'Normal',
        value: 0,
        style: 'info'
      }, {
        label: 'Important',
        value: 1,
        style: 'warning'
      }, {
        label: 'Exigency',
        value: 2,
        style: 'danger'
      }]
    },
    top: {
      label: 'Top',
      type: Boolean,
      default: false
    },
    parent: {
      label: 'Parent Event',
      type: 'relationship',
      ref: 'Event'
    },
    content: {
      label: 'Content',
      type: String,
      multiLine: true
    },
    info: {
      label: 'Event Info',
      type: Object,
      default: {}
    },
    read: {
      label: 'Read',
      type: Boolean,
      default: false
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  pic: Image;
  type: string;
  title: string;
  content: string;
  user: RecordId;
  from: RecordId;
  level: number;
  top: boolean;
  parent: RecordId;
  info: any;
  read: boolean;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
