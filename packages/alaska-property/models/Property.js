"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_model_1 = require("alaska-model");
const Category_1 = require("alaska-category/models/Category");
const __1 = require("..");
async function defaultFilters(ctx, filters) {
    if (!filters || !filters.cats)
        return null;
    let cats = filters.cats;
    delete filters.cats;
    let catIndex = [];
    let records = await Category_1.default.find({
        _id: { $in: cats }
    }).select('parents');
    records.forEach((cat) => {
        catIndex.push(cat._id);
        _.forEach(cat.parents, (p) => {
            catIndex.push(p);
        });
    });
    return {
        $or: [{
                common: true
            }, {
                cats: { $in: catIndex }
            }]
    };
}
class Property extends alaska_model_1.Model {
    async preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (this.sku) {
            this.required = true;
            this.multi = true;
            this.input = false;
        }
        if (this.input) {
            this.checkbox = false;
            this.switch = false;
        }
    }
    async preRemove() {
        if (await __1.default.models.PropertyValue.countDocuments({ prop: this._id })) {
            throw new Error('Can not remove property with values!');
        }
    }
}
Property.label = 'Properties';
Property.icon = 'th';
Property.defaultColumns = 'title group common required multi sku filter input activated sort createdAt';
Property.filterFields = 'group?switch&nolabel common sku cats @search';
Property.defaultSort = '-sort';
Property.searchFields = 'title help';
Property.defaultFilters = defaultFilters;
Property.api = {
    paginate: 1,
    list: 1,
};
Property.populations = {
    values: {
        select: 'title _common'
    }
};
Property.relationships = {
    values: {
        ref: 'PropertyValue',
        path: 'prop',
        protected: true,
        hidden: 'input'
    }
};
Property.groups = {
    editor: {
        title: 'Create Property Values',
        hidden: 'isNew'
    }
};
Property.fields = {
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
                optional: 'alaska-goods'
            }, {
                label: 'Post',
                value: 'post',
                optional: 'alaska-post'
            }]
    },
    cats: {
        label: 'Categories',
        type: 'category',
        ref: Category_1.default,
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
        type: Boolean,
        disabled: 'sku'
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
exports.default = Property;
