import { Model, Filters } from 'alaska-model';
import { Context } from 'alaska-http';
import Category from 'alaska-category/models/Category';
import service from '../';

function defaultFilters(ctx: Context, filters: Filters) {
  if (!filters || !filters.cats) return null;
  let cats = filters.cats;
  delete filters.cats;
  return {
    $or: [{
      common: true
    }, {
      cats
    }]
  };
}

export default class Property extends Model {
  static label = 'Properties';
  static icon = 'th';
  static defaultColumns = 'title group common required multi sku filter input activated sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';
  static defaultFilters = defaultFilters;

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
      protected: true,
      hidden: 'input'
    }
  };

  static groups = {
    editor: {
      title: 'Create Property Values',
      hidden: 'isNew'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      placeholder: 'eg. Size'
    },
    group: {
      label: 'Property Group',
      type: 'select',
      default: 'default',
      switch: true,
      index: true,
      required: true,
      options: [{
        label: 'Goods',
        value: 'goods',
        optional: 'alaska-goods.Goods'
      }, {
        label: 'Post',
        value: 'post',
        optional: 'alaska-post.Post'
      }]
    },
    cats: {
      label: 'Categories',
      type: 'category',
      ref: Category,
      multi: true,
      protected: true,
      hidden: 'common',
      filters: {
        group: ':group'
      }
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
      protected: true
    },
    help: {
      label: 'Help',
      type: String,
      protected: true,
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
      protected: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      protected: true
    },
    valueEditor: {
      type: String,
      view: 'PropertyValueEditor',
      protected: true,
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
      this.multi = true;
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
