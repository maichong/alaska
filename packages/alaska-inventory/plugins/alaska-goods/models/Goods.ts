export default {
  actions: {
    inventory: {
      title: 'Inventory',
      view: 'CreateInventoryButton',
      ability: 'alaska-inventory.Inventory.create',
      sled: 'alaska-inventory.Create',
      placements: ['editor', 'list'],
      needRecords: 1
    }
  },
  relationships: {
    inventoryList: {
      title: 'Inventory History',
      ref: 'alaska-inventory.Inventory',
      path: 'goods',
      protected: true
    }
  }
};
