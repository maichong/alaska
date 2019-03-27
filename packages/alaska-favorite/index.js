"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const alaska_model_1 = require("alaska-model");
class FavoriteService extends alaska_1.Service {
    preInit() {
        this.types = new Map();
        let model = alaska_model_1.Model.lookup('alaska-goods.Goods');
        model && this.types.set('goods', model);
        model = alaska_model_1.Model.lookup('alaska-shop.Shop');
        model && this.types.set('shop', model);
        model = alaska_model_1.Model.lookup('alaska-brand.Brand');
        model && this.types.set('brand', model);
        model = alaska_model_1.Model.lookup('alaska-post.Post');
        model && this.types.set('post', model);
    }
}
exports.default = new FavoriteService({
    id: 'alaska-favorite'
});
