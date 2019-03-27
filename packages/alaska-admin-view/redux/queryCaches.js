"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const redux_actions_1 = require("redux-actions");
const immutable = require("seamless-immutable");
exports.APPLY_QUERY_CACHE = 'APPLY_QUERY_CACHE';
exports.CLEAR_QUERY_CACHE = 'CLEAR_QUERY_CACHE';
exports.applyQueryCache = redux_actions_1.createAction(exports.APPLY_QUERY_CACHE);
exports.clearQueryCache = redux_actions_1.createAction(exports.CLEAR_QUERY_CACHE);
const INITIAL_STATE = immutable({});
exports.default = redux_actions_1.handleActions({
    REFRESH: () => INITIAL_STATE,
    APPLY_QUERY_CACHE: (state, action) => {
        const payload = action.payload;
        let caches = state[payload.model] || immutable([]);
        let found = false;
        caches = caches.map((cache) => {
            if (cache.search === payload.search && _.isEqual(cache.filters, payload.filters)) {
                found = true;
                return payload;
            }
            return cache;
        });
        if (!found) {
            caches = caches.concat([payload]);
        }
        let time = Date.now() - 2 * 60 * 1000;
        caches = caches.filter((cache) => cache.time > time);
        return state.set(payload.model, caches);
    },
    CLEAR_QUERY_CACHE: (state, action) => {
        const payload = action.payload;
        return state.without(payload.model);
    },
    CLEAR_LIST: (state, action) => {
        const payload = action.payload;
        return payload.model ? state.without(payload.model) : INITIAL_STATE;
    }
}, INITIAL_STATE);
