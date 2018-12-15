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
      ref: 'GoodsPropValue',
      path: 'prop',
      private: true
    }
  };

  static groups = {
    editor: {
      title: 'Create Property Values'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
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
      label: 'Common',
      default: false,
      type: Boolean
    },
    required: {
      label: 'Required',
      type: Boolean
    },
    multi: {
      label: 'Multi',
      type: Boolean
    },
    sku: {
      label: 'SKU',
      type: Boolean
    },
    filter: {
      label: 'Filter',
      type: Boolean
    },
    input: {
      label: 'Input',
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
      help: 'This message will display in the goods editor.'
    },
    values: {
      label: 'Values',
      type: 'relationship',
      ref: ['GoodsPropValue'],
      hidden: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      private: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      private: true
    },
    valueEditor: {
      type: String,
      view: 'GoodsPropsValueEditor',
      private: true,
      group: 'editor',
      depends: '_id',
      filter: '',
      cell: ''
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
  }

  async preRemove() {
    if (await service.models.PropertyValue.countDocuments({ prop: this._id })) {
      throw new Error('Can not remove property with values!');
    }
  }
}
