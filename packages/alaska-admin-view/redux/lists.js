"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_actions_1 = require("redux-actions");
const effects_1 = require("redux-saga/effects");
const immutable = require("seamless-immutable");
const _ = require("lodash");
const api_1 = require("../utils/api");
const index_1 = require("./index");
exports.CLEAR_LIST = 'CLEAR_LIST';
exports.LOAD_LIST = 'LOAD_LIST';
exports.LOAD_MORE = 'LOAD_MORE';
exports.APPLY_LIST = 'APPLY_LIST';
exports.LOAD_LIST_FAILURE = 'LOAD_LIST_FAILURE';
exports.clearList = redux_actions_1.createAction(exports.CLEAR_LIST);
exports.loadList = redux_actions_1.createAction(exports.LOAD_LIST);
exports.loadMore = redux_actions_1.createAction(exports.LOAD_MORE);
exports.applyList = redux_actions_1.createAction(exports.APPLY_LIST, (model, res) => Object.assign({ model }, res));
exports.loadListFailure = redux_actions_1.createAction(exports.LOAD_LIST_FAILURE, (model, error) => ({ model, error }));
const INITIAL_STATE = immutable({});
const EMPTY_LIST = immutable({
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
    previous: 0,
    next: 0,
    search: '',
    filters: null,
    results: [],
    error: null,
    fetching: false
});
exports.default = redux_actions_1.handleActions({
    REFRESH: () => INITIAL_STATE,
    LOAD_LIST: (state, action) => {
        const payload = action.payload;
        let list = state[payload.model] || EMPTY_LIST;
        list = list.merge(_.assign({}, payload, { fetching: true }));
        return state.set(payload.model, list);
    },
    LOAD_MORE: (state, action) => {
        const payload = action.payload;
        let list = state[payload.model] || EMPTY_LIST;
        list = list.merge(_.assign({}, payload, { fetching: true }));
        return state.set(payload.model, list);
    },
    CLEAR_LIST: (state, action) => {
        const payload = action.payload;
        return payload.model ? state.without(payload.model) : INITIAL_STATE;
    },
    APPLY_LIST: (state, action) => {
        const payload = action.payload;
        let model = payload.model;
        let info = _.omit(payload, 'results');
        let list = state[payload.model] || EMPTY_LIST;
        list = list.merge(_.assign({}, info, { error: '', fetching: false }));
        if (payload.page === 1) {
            list = list.set('results', payload.results);
        }
        else {
            let results = list.results || immutable([]);
            list = list.set('results', results.concat(payload.results));
        }
        return state.set(model, list);
    },
    LOAD_LIST_FAILURE: (state, action) => {
        const payload = action.payload;
        let list = state[payload.model] || EMPTY_LIST;
        return state.set(payload.model, list.merge({ error: payload.error, fetching: false }));
    },
    APPLY_DETAILS: (state, action) => {
        const payload = action.payload;
        let { model, data } = payload;
        if (!_.isArray(data))
            return state;
        let list = state[model];
        if (!list)
            return;
        let found = false;
        let results = _.map(list.results, (record) => {
            if (record._id === data._id) {
                found = true;
                return record.merge(data);
            }
            return record;
        });
        if (!found)
            return;
        list = list.set('results', results);
        state = state.set(model, list);
        return state;
    },
    BATCH_APPLY_DETAILS: (state, action) => {
        const payload = action.payload;
        function forEach(item) {
            let { model, data } = item;
            let list = state[model];
            if (!list)
                return;
            let found = false;
            let results = _.map(list.results, (record) => {
                if (record._id === data._id) {
                    found = true;
                    return record.merge(data);
                }
                return record;
            });
            if (!found)
                return;
            list = list.set('results', results);
            state = state.set(model, list);
        }
        if (_.isArray(payload)) {
            _.forEach(payload, forEach);
        }
        return state;
    },
    LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
function* listSaga({ payload }) {
    try {
        let res = yield api_1.default.get('/list', {
            query: _.assign({
                _model: payload.model,
                _search: payload.search,
                _limit: payload.limit || 50,
                _page: payload.page || 1,
                _sort: payload.sort || ''
            }, payload.filters)
        });
        _.forEach(res.results, (data) => {
            data.id = data._id;
            data.rev = Date.now();
        });
        yield effects_1.put(exports.applyList(payload.model, res));
    }
    catch (e) {
        yield effects_1.put(exports.loadListFailure(payload.model, e));
    }
}
exports.listSaga = listSaga;
function* moreSaga({ payload }) {
    let model = payload.model;
    let lists = index_1.default.getState().lists;
    let list = lists[model];
    if (!list)
        return;
    try {
        let res = yield api_1.default.get('/list', {
            query: _.assign({
                _model: payload.model,
                _search: list.search,
                _limit: list.limit || 30,
                _page: list.page + 1,
                _sort: list.sort || ''
            }, list.filters)
        });
        _.forEach(res.results, (data) => {
            data.id = data._id;
            data.rev = Date.now();
        });
        yield effects_1.put(exports.applyList(payload.model, res));
    }
    catch (e) {
        yield effects_1.put(exports.loadListFailure(payload.model, e));
    }
}
exports.moreSaga = moreSaga;
