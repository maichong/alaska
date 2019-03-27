"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const _ = require("lodash");
const utils_1 = require("alaska-model/utils");
const Category_1 = require("../models/Category");
class UpdateCatRef extends alaska_sled_1.Sled {
    async exec(params) {
        let { category, removed } = params;
        let parent;
        if (category.parent) {
            parent = await Category_1.default.findById(category.parent);
        }
        if (removed) {
            if (category.parent) {
                if (parent) {
                    await UpdateCatRef.run({ category: parent });
                }
            }
            return;
        }
        let children = await Category_1.default.find({ parent: category._id }).select('_id');
        category.children = _(children).mapValues('_id').values().value();
        if (parent) {
            if (!utils_1.isIdEqual(_.last(category.parents), category.parent)) {
                category.parents = _.concat(parent.parents, [parent._id]);
                await category.save();
                await UpdateCatRef.run({ category: parent });
            }
        }
        else {
            await category.save();
        }
        let others = await Category_1.default.find({ children: category._id });
        for (let other of others) {
            if (parent && utils_1.isIdEqual(other, parent))
                continue;
            other.children = _.filter(other.children, (child) => !utils_1.isIdEqual(child, category));
            await other.save();
        }
    }
}
exports.default = UpdateCatRef;
