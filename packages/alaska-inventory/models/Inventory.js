"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Inventory extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (this.type === 'input') {
            if (!this.quantity || this.quantity <= 0) {
                throw new Error('invalid quantity');
            }
        }
        else {
            if (!this.quantity || this.quantity >= 0) {
                throw new Error('invalid quantity');
            }
        }
    }
}
Inventory.label = 'Inventory History';
Inventory.icon = 'truck';
Inventory.defaultColumns = 'goods sku type quantity inventory desc createdAt';
Inventory.filterFields = 'sku type createdAt';
Inventory.defaultSort = '-createdAt';
Inventory.nocreate = true;
Inventory.noupdate = true;
Inventory.api = {
    paginate: 2,
    list: 2,
    create: 2,
    count: 2
};
Inventory.fields = {
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true,
    },
    goods: {
        label: 'Goods',
        type: 'relationship',
        ref: 'alaska-goods.Goods',
        required: true,
        index: true
    },
    sku: {
        label: 'SKU',
        type: 'relationship',
        ref: 'alaska-sku.Sku',
        optional: 'alaska-sku'
    },
    type: {
        label: 'Type',
        type: 'select',
        switch: true,
        default: 'input',
        options: [{
                label: 'Input',
                value: 'input'
            }, {
                label: 'Output',
                value: 'output'
            }]
    },
    quantity: {
        label: 'Quantity',
        type: Number,
        required: true
    },
    inventory: {
        label: 'Residual Inventory',
        type: Number
    },
    desc: {
        label: 'Description',
        type: String,
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Inventory;
