
import { Model } from 'alaska-model';
import { Context } from 'alaska-http';

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
  static defaultColumns = 'icon label type parent sort service link ability super activated';
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
      hidden: 'parent',
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

  _id: string;
  id: string;
  label: string;
  icon: string;
  type: string;
  parent: string;
  nav: string;
  service: string;
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
