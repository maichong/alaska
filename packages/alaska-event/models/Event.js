import { Model } from 'alaska';

export default class Event extends Model {
  static label = 'Event';
  static icon = 'bell';
  static titleField = 'title';
  static defaultColumns = 'pic title user type parent read createdAt';
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
      ref: 'alaska-user.User',
      index: true,
      required: true
    },
    from: {
      label: 'From',
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
    parent: {
      label: 'Parent Event',
      ref: 'Event'
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

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
