"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const alaska_model_1 = require("alaska-model");
const utils_1 = require("alaska-model/utils");
const _ = require("lodash");
const __1 = require("..");
class Category extends alaska_model_1.Model {
    async preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (this.parent) {
            if (utils_1.isIdEqual(this.parent, this.id)) {
                throw new alaska_1.NormalError('Category parent can not be self');
            }
            let parent = await Category.findById(this.parent);
            if (!parent)
                throw new alaska_1.NormalError('Parent category not found');
            if (_.find(parent.parents, (p) => utils_1.isIdEqual(p, this.id)))
                throw new alaska_1.NormalError('Parent category circular dependency');
        }
        if (this.isNew) {
            let old = await Category.findOne({ parent: this.parent, title: this.title, group: this.group });
            if (old)
                __1.default.error('Category title has already exists');
        }
        this.__parentChanged = this.isNew || this.isModified('parent');
        this.__groupChanged = this.isModified('group');
    }
    postSave() {
        (async () => {
            if (this.__parentChanged) {
                await __1.default.sleds.UpdateCatRef.run({ category: this });
            }
            await Category.updateMany({ parents: this._id }, {
                group: this.group
            });
        })();
    }
    async preRemove() {
        let count = await Category.countDocuments({ parent: this._id });
        if (count)
            __1.default.error('Can not remove category which has children!');
    }
    postRemove() {
        __1.default.sleds.UpdateCatRef.run({ category: this, removed: true });
    }
}
Category.label = 'Category';
Category.icon = 'th-list';
Category.defaultColumns = '_id group parent title icon pic activated sort createdAt';
Category.defaultSort = 'parent -sort';
Category.searchFields = 'title';
Category.filterFields = 'group?switch&nolabel parent activated @search';
Category.api = {
    list: 1,
    paginate: 1
};
Category.relationships = {
    subs: {
        ref: 'Category',
        path: 'parent',
        title: 'Sub Categories',
        protected: true
    },
    goods: {
        ref: 'alaska-goods.Goods',
        optional: 'alaska-goods',
        path: 'cats'
    }
};
Category.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    icon: {
        label: 'Icon',
        type: 'image'
    },
    pic: {
        label: 'Picture',
        type: 'image'
    },
    desc: {
        label: 'Description',
        type: String
    },
    group: {
        label: 'Category Group',
        type: 'select',
        default: 'default',
        switch: true,
        index: true,
        required: true,
        options: [{
                label: 'Default',
                value: 'default'
            }, {
                label: 'Goods',
                value: 'goods',
                optional: 'alaska-goods'
            }, {
                label: 'Post',
                value: 'post',
                optional: 'alaska-post'
            }]
    },
    parent: {
        label: 'Parent Category',
        type: 'category',
        ref: 'Category',
        index: true,
        filters: {
            group: ':group'
        }
    },
    parents: {
        label: 'Parents',
        type: 'category',
        ref: 'Category',
        multi: true,
        hidden: true,
        protected: true,
        index: true
    },
    children: {
        label: 'Sub Categories',
        type: 'relationship',
        ref: 'Category',
        multi: true,
        hidden: true,
        protected: true
    },
    activated: {
        label: 'Activated',
        type: Boolean,
        default: true,
        protected: true
    },
    sort: {
        label: 'Sort',
        type: Number,
        default: 0,
        protected: true
    },
    createdAt: {
        label: 'Created At',
        type: Date,
        protected: true
    }
};
exports.default = Category;
