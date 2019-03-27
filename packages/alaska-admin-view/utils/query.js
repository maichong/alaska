"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const api_1 = require("./api");
const redux_1 = require("../redux");
const queryCaches_1 = require("../redux/queryCaches");
const immutable = require("seamless-immutable");
function default_1(options) {
    let search = options.search || '';
    let filters = options.filters || null;
    let state = redux_1.default.getState().queryCaches;
    if (state[options.model]) {
        let caches = state[options.model];
        for (let cache of caches) {
            if (cache.search === search && _.isEqual(cache.filters, filters) && _.isEqual(cache.populations, options.populations)) {
                return Promise.resolve(cache);
            }
        }
    }
    return api_1.default.get('/list', {
        query: _.assign({
            _model: options.model,
            _search: search,
            _populations: options.populations,
            _limit: 1000,
            _page: 1
        }, filters)
    }).then((result) => {
        result.model = options.model;
        result.filters = filters;
        result.search = search;
        result.populations = options.populations;
        result.time = Date.now();
        result = immutable(result);
        redux_1.default.dispatch(queryCaches_1.applyQueryCache(result));
        return result;
    });
}
exports.default = default_1;
