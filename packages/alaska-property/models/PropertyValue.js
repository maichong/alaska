"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const Category_1 = require("alaska-category/models/Category");
const Property_1 = require("./Property");
const __1 = require("..");
class PropertyValue extends alaska_model_1.Model {
    async preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.shop) {
            this.shared = true;
        }
        let prop = await Property_1.default.findById(this.prop);
        if (!prop)
            __1.default.error('Property not exist!');
        let filters = {
            prop: this.prop,
            title: this.title
        };
        if (this.shared) {
            filters.shared = true;
        }
        else if (this.shop) {
            filters.$or = [
                { shop: this.shop },
                { shared: true }
            ];
        }
        let count = await PropertyValue.countDocuments(filters).where('_id').ne(this._id);
        if (count) {
            __1.default.error('Reduplicate prop value title');
        }
    }
    postSave() {
        this.processProp();
    }
    postRemove() {
        this.processProp();
    }
    async processProp() {
        let prop = await Property_1.default.findById(this.prop).session(this.$session());
        if (!prop)
            return;
        let values = await PropertyValue.find({ prop: prop._id }).session(this.$session());
        prop.values = values.map((v) => (v._id));
        await prop.save();
    }
}
PropertyValue.label = 'Property Values';
PropertyValue.icon = 'square';
PropertyValue.defaultColumns = 'title prop common shop shared sort createdAt';
PropertyValue.filterFields = 'shared prop shop @search';
PropertyValue.searchFields = 'title';
PropertyValue.defaultSort = 'prop -sort -createdAt';
PropertyValue.api = {
    paginate: 1,
    list: 1,
};
PropertyValue.fields = {
    prop: {
        label: 'Property',
        type: 'relationship',
        ref: Property_1.default,
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
        ref: Category_1.default,
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
exports.default = PropertyValue;
