
import { Model } from 'alaska-model';
import { Context } from 'alaska-http';
import { Colors } from '@samoyed/types';

function defaultFilters(ctx: Context) {
  if (ctx.state.superMode) return null;
  return {
    super: { $ne: true }
  };
}

export default class AdminMenu extends Model {
  static label = 'Admin Menu';
  static icon = 'bars';
  static titleField = 'label';
  static defaultColumns = 'icon label type nav parent sort link ability super activated';
  static filterFields = 'type?switch&nolabel @parent @search';
  static defaultSort = '-sort';
  static searchFields = '_id label link parent';
  static defaultFilters = defaultFilters;

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
      type: 'relationship',
      ref: 'alaska-user.Ability'
    },
    link: {
      label: 'Link',
      type: String,
      default: '',
      hidden: {
        type: 'group'
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
    nav: {
      label: 'Nav',
      type: 'relationship',
      ref: 'AdminNav',
      switch: true,
      hidden: 'parent',
      default: 'default'
    },
    badge: {
      label: 'Badge',
      type: String
    },
    badgeColor: {
      label: 'Badge Color',
      type: String,
      default: 'danger'
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

  _id: string;
  id: string;
  label: string;
  icon: string;
  type: 'link' | 'group';
  parent: string;
  nav: string;
  badge: string;
  badgeColor: Colors;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;

  async preSave() {
    if (this.parent && this.parent === this._id) {
      throw new Error('Parent can not be self');
    }
  }
}
