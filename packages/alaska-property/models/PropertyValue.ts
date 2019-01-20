import { Model } from 'alaska-model';
import Category from 'alaska-category/models/Category';
import Property from './Property';

export default class PropertyValue extends Model {
  static label = 'Property Values';
  static icon = 'square';
  static defaultColumns = 'title prop common sort createdAt';
  static defaultSort = '-sort -createdAt';

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
      fixed: 'id'
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
      protected: true,
      disabled: 'common'
    },
    common: {
      label: 'Common',
      default: true,
      type: Boolean
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
  prop: Object;
  cats: Object;
  common: boolean;
  sort: number;
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    let count = await PropertyValue.countDocuments({
      prop: this.prop,
      title: this.title
    }).where('_id').ne(this._id);
    if (count) {
      throw new Error('Reduplicate prop value title');
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
