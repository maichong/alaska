"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Post extends alaska_model_1.Model {
    async preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.seoTitle) {
            this.seoTitle = this.title;
        }
        if (this.cat) {
            const Category = alaska_model_1.Model.lookup('alaska-category.Category');
            if (!Category)
                return;
            let cat = await Category.findById(this.cat);
            this.cats = (cat.parents || []).concat(cat._id);
        }
    }
}
Post.label = 'Post';
Post.icon = 'file-text-o';
Post.defaultColumns = 'pic title cat user createdAt';
Post.defaultSort = '-createdAt';
Post.searchFields = 'title summary';
Post.filterFields = 'recommend user createdAt?range @search';
Post.autoSelect = false;
Post.api = {
    paginate: 1,
    list: 1,
    show: 1
};
Post.scopes = {
    list: 'title user summary pic cat hots createdAt'
};
Post.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User'
    },
    cat: {
        label: 'Category',
        type: 'relationship',
        ref: 'alaska-category.Category',
        optional: 'alaska-category',
        filters: {
            group: 'post'
        }
    },
    cats: {
        label: 'Categories',
        type: 'relationship',
        ref: 'alaska-category.Category',
        optional: 'alaska-category',
        multi: true,
        hidden: true,
        private: true
    },
    seoTitle: {
        label: 'SEO Title',
        type: String,
        default: ''
    },
    seoKeywords: {
        label: 'SEO Keywords',
        type: String,
        default: ''
    },
    seoDescription: {
        label: 'SEO Description',
        type: String,
        default: ''
    },
    summary: {
        label: 'Summary',
        type: String,
        default: ''
    },
    pic: {
        label: 'Main Picture',
        type: 'image'
    },
    source: {
        label: 'Source',
        type: String
    },
    hots: {
        label: 'Hots',
        type: Number,
        default: 0
    },
    recommend: {
        label: 'Recommend',
        type: Boolean
    },
    relations: {
        label: 'Related Posts',
        type: 'relationship',
        ref: 'Post',
        multi: true,
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    content: {
        label: 'Content',
        type: 'html',
        default: ''
    }
};
exports.default = Post;
