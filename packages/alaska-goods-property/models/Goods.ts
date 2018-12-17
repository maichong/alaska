import * as _ from 'lodash';
import { Prop } from '..';

export default {
  groups: {
    props: {
      title: 'Goods Properties',
      after: 'inventory'
    }
  },
  fields: {
    props: {
      label: 'Goods Properties',
      type: Object,
      default: [] as Prop[],
      view: 'PropertyEditor',
      group: 'props'
    },
    propValues: {
      label: 'Properties Values',
      type: 'relationship',
      ref: 'alaska-property.PropertyValue',
      default: [] as any[],
      index: true,
      multi: true,
      hidden: true,
      private: true
    },
  },
  preSave() {
    // 如果商品属性发生更改,重建属性值索引,供前端检索
    if (this.isModified('props')) {
      let propValues: any[] = [];
      _.each(this.props, (prop: Prop) => {
        if (prop.filter) {
          _.each(prop.values, (value) => {
            propValues.push(String(value));
          });
        }
      });
      this.propValues = propValues;
    }
  }
};
