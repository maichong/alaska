import { Model } from 'alaska-model';
import * as _ from 'lodash';
import Category from 'alaska-category/models/Category';
import service from '../';

export default class Property extends Model {
  static label = 'Properties';
  static icon = 'th';
  static defaultColumns = 'title common required multi sku filter input activated sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';

  static api = {
    paginate: 1,
    list: 1,
  };

  static populations = {
    values: {
      select: 'title _common'
    }
  };

  static relationships = {
    values: {
      ref: 'PropertyValue',
      path: 'prop',
      private: true,
      hidden: 'input'
    }
  };

  static groups = {
    editor: {
      title: 'Create Property Values',
      hidden: '!id'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      placeholder: 'eg. Size'
    },
    cats: {
      label: 'Categories',
      type: 'category',
      ref: Category,
      multi: true,
      private: true,
      hidden: 'common'
    },
    common: {
      label: 'Common property',
      default: false,
      type: Boolean,
      help: 'Available for all categories'
    },
    sku: {
      label: 'SKU property',
      type: Boolean
    },
    required: {
      label: 'Required',
      type: Boolean,
      disabled: 'sku'
    },
    multi: {
      label: 'Multipe',
      type: Boolean,
      disabled: 'sku'
    },
    filter: {
      label: 'Allow filter',
      type: Boolean
    },
    input: {
      label: 'Allow input',
      type: Boolean
    },
    checkbox: {
      label: 'Checkbox View',
      type: Boolean,
      disabled: 'input'
    },
    switch: {
      label: 'Switch View',
      type: Boolean,
      disabled: 'input'
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0,
      private: true
    },
    help: {
      label: 'Help',
      type: String,
      help: 'This message will display in the property field.'
    },
    values: {
      label: 'Values',
      type: 'relationship',
      ref: 'PropertyValue',
      multi: true,
      hidden: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
      private: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      private: true
    },
    valueEditor: {
      type: String,
      view: 'PropertyValueEditor',
      private: true,
      group: 'editor',
      filter: '',
      cell: '',
      hidden: 'input'
    }
  };

  title: string;
  cats: Object[];
  common: boolean;
  required: boolean;
  multi: boolean;
  sku: boolean;
  filter: boolean;
  input: boolean;
  checkbox: boolean;
  switch: boolean;
  sort: number;
  help: string;
  values: Object[];
  activated: boolean;
  createdAt: Date;
  valueEditor: string;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.sku) {
      this.required = true;
      this.multi = false;
    }
    if (this.input) {
      this.checkbox = false;
      this.switch = false;
    }
  }

  async preRemove() {
    if (await service.models.PropertyValue.countDocuments({ prop: this._id })) {
      throw new Error('Can not remove property with values!');
    }
  }
}
