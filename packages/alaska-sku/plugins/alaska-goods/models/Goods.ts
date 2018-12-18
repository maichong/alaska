export default {
  groups: {
    sku: {
      title: 'SKU',
      panel: false,
      after: 'default'
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
      type: Object,
      view: 'SkuEditor',
      group: 'sku',
      private: true
    },
  },
}
