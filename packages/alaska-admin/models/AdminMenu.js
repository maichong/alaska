'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class AdminMenu extends _alaska.Model {

  async preSave() {
    if (this.parent && this.parent === this._id) {
      throw new Error('Parent can not be self');
    }
  }
}
exports.default = AdminMenu;
AdminMenu.label = 'Admin Menu';
AdminMenu.icon = 'bars';
AdminMenu.titleField = 'label';
AdminMenu.defaultColumns = 'icon label type parent sort service link ability super activated';
AdminMenu.defaultSort = '-sort';
AdminMenu.searchFields = 'label link parent';

AdminMenu.defaultFilters = ctx => ctx.state.superMode ? {} : { super: { $ne: true } };

AdminMenu.fields = {
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
    ref: ['alaska-user.Ability']
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
    super: true
  },
  activated: {
    label: 'Activated',
    type: Boolean
  }
};