"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_actions_1 = require("redux-actions");
const effects_1 = require("redux-saga/effects");
const immutable = require("seamless-immutable");
const _ = require("lodash");
const api_1 = require("../utils/api");
const details_1 = require("./details");
const lists_1 = require("./lists");
const queryCaches_1 = require("./queryCaches");
const _1 = require(".");
exports.ACTION_REQUEST = 'ACTION_REQUEST';
exports.ACTION_SUCCESS = 'ACTION_SUCCESS';
exports.ACTION_FAILURE = 'ACTION_FAILURE';
const INITIAL_STATE = immutable({
    action: '',
    model: '',
    fetching: false,
    request: '',
    error: null,
    records: [],
    search: '',
    sort: '',
    filters: null,
    body: {},
    result: {}
});
exports.actionRequest = redux_actions_1.createAction(exports.ACTION_REQUEST);
exports.actionSuccess = redux_actions_1.createAction(exports.ACTION_SUCCESS);
exports.actionFailure = redux_actions_1.createAction(exports.ACTION_FAILURE);
function execAction(payload) {
    return new Promise((resolve, reject) => {
        payload.callback = function (error, result) {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        };
        _1.default.dispatch(exports.actionRequest(payload));
    });
}
exports.execAction = execAction;
exports.default = redux_actions_1.handleActions({
    ACTION_REQUEST: (state, action) => {
        const payload = action.payload;
        return INITIAL_STATE.merge(payload).set('fetching', true);
    },
    ACTION_SUCCESS: (state, action) => {
        const payload = action.payload;
        return state.merge({ fetching: false, error: null, result: payload });
    },
    ACTION_FAILURE: (state, action) => {
        const payload = action.payload;
        return state.merge({ fetching: false, error: payload });
    }
}, INITIAL_STATE);
function* actionSaga({ payload }) {
    let result = [];
    try {
        result = yield api_1.default.post('/action', {
            query: _.assign({
                _model: payload.model,
                _records: payload.records,
                _action: payload.action,
                _search: payload.search,
                _sort: payload.sort || ''
            }, payload.filters),
            body: payload.body || {}
        });
        yield effects_1.put(exports.actionSuccess(result));
        if (payload.action === 'create' || payload.action === 'remove') {
            yield effects_1.put(lists_1.clearList({ model: payload.model }));
            yield effects_1.put(queryCaches_1.clearQueryCache({ model: payload.model }));
        }
        else if (payload.action === 'update') {
            yield effects_1.put(queryCaches_1.clearQueryCache({ model: payload.model }));
            if (Array.isArray(result)) {
                let list = result.map((data) => ({ model: payload.model, data: _.assign(data, { id: data._id, _rev: Date.now() }) }));
                yield effects_1.put(details_1.batchApplyDetails(list));
            }
            else {
                result.id = result._id;
                result._rev = Date.now();
                yield effects_1.put(details_1.applyDetails(payload.model, result));
            }
        }
        if (payload.callback) {
            payload.callback(null, result);
        }
    }
    catch (e) {
        yield effects_1.put(exports.actionFailure(e));
        if (payload.callback) {
            payload.callback(e);
        }
    }
}
exports.actionSaga = actionSaga;
