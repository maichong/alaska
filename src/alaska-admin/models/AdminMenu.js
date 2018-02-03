// @flow

import { Model } from 'alaska';

export default class AdminMenu extends Model<AdminMenu> {
  static label = 'Admin Menu';
  static icon = 'bars';
  static titleField = 'label';
  static defaultColumns = 'icon label type parent sort service link ability super activated';
  static defaultSort = '-sort';
  static searchFields = '_id label link parent';

  static defaultFilters = (ctx: Alaska$Context) => (ctx.state.superMode ? {} : { super: { $ne: true } });

  static fields = {
    _id: {
      type: String
    },
    label: {
      label: 'Title',
      type: String,
      required: true
    },
    icon: {
      label: 'Icon',
      type: 'icon',
      default: ''
    },
    type: {
      label: 'Type',
      type: 'select',
      default: 'link',
      switch: true,
      options: [{
        label: '链接',
        value: 'link'
      }, {
        label: '组',
        value: 'group'
      }]
    },
    ability: {
      label: 'Ability',
      ref: 'alaska-user.Ability'
    },
    link: {
      label: 'Link',
      type: String,
      default: '',
      depends: {
        type: 'link'
      },
      fullWidth: true
    },
    parent: {
      label: 'Parent Menu',
      type: 'category',
      ref: 'AdminMenu',
      filters: {
        type: 'group'
      }
    },
    service: {
      label: 'Service',
      type: String
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    super: {
      label: 'Super',
      type: Boolean,
      super: true,
      noexport: true
    },
    activated: {
      label: 'Activated',
      type: Boolean
    }
  };

  label: string;
  icon: string;
  type: string;
  parent: Object;
  service: string;
  sort: number;
  super: boolean;
  activated: boolean;

  async preSave() {
    if (this.parent && this.parent === this._id) {
      throw new Error('Parent can not be self');
    }
  }
}
