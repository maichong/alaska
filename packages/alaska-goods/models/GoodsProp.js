'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _GoodsCat = require('./GoodsCat');

var _GoodsCat2 = _interopRequireDefault(_GoodsCat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class GoodsProp
 * @extends Model
 */
class GoodsProp extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.isNew || this.isModified('cats') || this.isModified('common')) {
      await this.updateCatsIndex();
    }
  }

  async preRemove() {
    const GoodsPropValue = _3.default.getModel('GoodsPropValue');
    if (await GoodsPropValue.count({ prop: this._id })) {
      throw new Error('Can not remove this goods prop, please remove the values first!');
    }
  }

  /**
   * 更新本属性所对应分类的关联索引
   */
  async updateCatsIndex() {
    if (!this.common && this.cats.length) {
      let cats = {};
      for (let cid of this.cats) {
        if (cats[cid]) {
          continue;
        }
        // $Flow
        let cat = await _GoodsCat2.default.findById(cid);
        cats[cid] = cat;
        let subs = await cat.allSubs();
        _lodash2.default.defaults(cats, subs);
      }
      this.catsIndex = Object.keys(cats);
    } else {
      this.catsIndex = undefined;
    }
  }
}
exports.default = GoodsProp;
GoodsProp.label = 'Goods Properties';
GoodsProp.icon = 'th';
GoodsProp.defaultColumns = 'title common required multi sku filter input activated sort createdAt';
GoodsProp.defaultSort = '-sort';
GoodsProp.searchFields = 'title';
GoodsProp.api = {
  paginate: 1,
  list: 1
};
GoodsProp.populations = {
  values: {
    select: 'title _common _catsIndex'
  }
};
GoodsProp.relationships = {
  values: {
    ref: 'GoodsPropValue',
    path: 'prop',
    private: true
  }
};
GoodsProp.groups = {
  editor: {
    title: 'Create Property Values'
  }
};
GoodsProp.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  cats: {
    label: 'Categories',
    type: 'category',
    ref: 'GoodsCat',
    multi: true,
    private: true,
    disabled: 'common'
  },
  catsIndex: {
    label: 'Categories',
    ref: ['GoodsCat'],
    index: true,
    hidden: true,
    private: true
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
    filter: false,
    cell: false
  }
};