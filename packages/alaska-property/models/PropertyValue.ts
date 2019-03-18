import { Model, RecordId } from 'alaska-model';
import Category from 'alaska-category/models/Category';
import Property from './Property';
import service from '..';

export default class PropertyValue extends Model {
  static label = 'Property Values';
  static icon = 'square';
  static defaultColumns = 'title prop common shop shared sort createdAt';
  static filterFields = 'shared prop shop @search';
  static searchFields = 'title';
  static defaultSort = 'prop -sort -createdAt';

  static api = {
    paginate: 1,
    list: 1,
  };

  static fields = {
    prop: {
      label: 'Property',
      type: 'relationship',
      ref: Property,
      index: true,
      required: true,
      fixed: '!isNew'
    },
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
      protected: true,
      hidden: 'common'
    },
    common: {
      label: 'Common',
      default: true,
      type: Boolean
    },
    shop: {
      label: 'Shop',
      type: 'relationship',
      ref: 'alaska-shop.Shop',
      optional: 'alaska-shop'
    },
    shared: {
      label: 'Shared',
      type: Boolean,
      default: true,
      hidden: '!shop'
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      protected: true
    }
  };

  title: string;
  prop: RecordId;
  cats: RecordId;
  common: boolean;
  shop: RecordId;
  shared: boolean;
  sort: number;
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.shop) {
      this.shared = true;
    }

    let prop = await Property.findById(this.prop);
    if (!prop) service.error('Property not exist!');

    let filters: any = {
      prop: this.prop,
      title: this.title
    };

    if (this.shared) {
      filters.shared = true;
    } else if (this.shop) {
      filters.$or = [
        { shop: this.shop },
        { shared: true }
      ];
    }
    let count = await PropertyValue.countDocuments(filters).where('_id').ne(this._id);
    if (count) {
      service.error('Reduplicate prop value title');
    }
  }

  postSave() {
    this.processProp();
  }

  postRemove() {
    this.processProp();
  }

  /**
   * 整理相应属性的属性值
   */
  async processProp() {
    let prop: Property = await Property.findById(this.prop).session(this.$session());
    if (!prop) return;
    let values: PropertyValue[] = await PropertyValue.find({ prop: prop._id }).session(this.$session());
    prop.values = values.map((v: PropertyValue) => (v._id));
    await prop.save();
  }
}
