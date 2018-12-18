import Sku from '../../../models/Sku';

export default {
  groups: {
    sku: {
      title: 'SKU',
      panel: false,
      after: 'props'
    }
  },
  fields: {
    skus: {
      label: 'SKU',
      type: 'relationship',
      ref: 'alaska-sku.Sku',
      multi: true,
      hidden: true
    },
    sku: {
      type: Sku,
      multi: true,
      private: true,
      view: 'SkuEditor',
      group: 'sku'
    },
  },
  preSave() {
    // TODO:
  }
}
