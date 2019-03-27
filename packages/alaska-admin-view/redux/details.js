"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_actions_1 = require("redux-actions");
const immutable = require("seamless-immutable");
const _ = require("lodash");
const api_1 = require("../utils/api");
const index_1 = require("./index");
exports.LOAD_DETAILS = 'LOAD_DETAILS';
exports.APPLY_DETAILS = 'APPLY_DETAILS';
exports.BATCH_APPLY_DETAILS = 'BATCH_APPLY_DETAILS';
exports.CLEAR_DETAILS = 'CLEAR_DETAILS';
exports.BATCH_CLEAR_DETAILS = 'BATCH_CLEAR_DETAILS';
exports.clearDetails = redux_actions_1.createAction(exports.CLEAR_DETAILS);
exports.batchClearDetails = redux_actions_1.createAction(exports.BATCH_CLEAR_DETAILS);
exports.loadDetails = redux_actions_1.createAction(exports.LOAD_DETAILS);
exports.applyDetails = redux_actions_1.createAction(exports.APPLY_DETAILS, (model, data) => ({ model, data }));
exports.batchApplyDetails = redux_actions_1.createAction(exports.BATCH_APPLY_DETAILS);
const INITIAL_STATE = immutable({});
exports.default = redux_actions_1.handleActions({
    REFRESH: () => INITIAL_STATE,
    CLEAR_DETAILS: (state, action) => {
        const payload = action.payload;
        const { model, ids } = payload;
        if (!ids) {
            return state.without(model);
        }
        let map = state[model];
        if (!map)
            return state;
        map = map.without(ids);
        return state.set(model, map);
    },
    BATCH_CLEAR_DETAILS: (state, action) => {
        const payload = action.payload;
        payload.forEach(({ model, ids }) => {
            if (ids) {
                let map = state[model];
                if (map) {
                    map = map.without(ids);
                    state = state.set(model, map);
                }
            }
            else {
                state = state.without(model);
            }
        });
        return state;
    },
    APPLY_DETAILS: (state, action) => {
        const payload = action.payload;
        let { model, data } = payload;
        let map = state[model] || immutable({});
        map = map.set(data._id, data);
        return state.set(model, map);
    },
    BATCH_APPLY_DETAILS: (state, action) => {
        const payload = action.payload;
        for (let { model, data } of payload) {
            let map = state[model] || immutable({});
            map = map.set(data._id, data);
            state = state.set(model, map);
        }
        return state;
    },
    LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
const fetching = {};
let queue = [];
let timer = 0;
function* detailsSaga({ payload }) {
    let fetchingKey = `${payload.model}/${payload.id}`;
    try {
        if (fetching[fetchingKey]) {
            return;
        }
        fetching[fetchingKey] = true;
        let res = yield api_1.default.get('/details', {
            query: {
                _model: payload.model,
                _id: payload.id,
            }
        });
        fetching[fetchingKey] = false;
        queue.push({ model: payload.model, data: _.assign(res, { id: res._id, _rev: Date.now() }) });
    }
    catch (e) {
        fetching[fetchingKey] = false;
        queue.push({
            model: payload.model,
            data: {
                _id: payload.id,
                _error: e.message
            }
        });
    }
    if (!timer) {
        timer = window.setTimeout(() => {
            timer = 0;
            let cur = queue;
            queue = [];
            if (cur.length) {
                index_1.default.dispatch(exports.batchApplyDetails(cur));
            }
        }, 50);
    }
}
exports.detailsSaga = detailsSaga;
