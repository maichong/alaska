"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_actions_1 = require("redux-actions");
const effects_1 = require("redux-saga/effects");
const immutable = require("seamless-immutable");
const api_1 = require("../utils/api");
const settings_1 = require("./settings");
exports.LOGIN = 'LOGIN';
exports.LOGOUT = 'LOGOUT';
exports.LOGIN_FAILURE = 'LOGIN_FAILURE';
exports.LOGIN_SUCCESS = 'LOGIN_SUCCESS';
exports.login = redux_actions_1.createAction(exports.LOGIN);
exports.loginSuccess = redux_actions_1.createAction(exports.LOGIN_SUCCESS);
exports.loginFailure = redux_actions_1.createAction(exports.LOGIN_FAILURE);
exports.logout = redux_actions_1.createAction(exports.LOGOUT);
const INITIAL_STATE = immutable({
    error: null
});
exports.default = redux_actions_1.handleActions({
    LOGIN: (state) => state.set('error', null),
    LOGIN_FAILURE: (state, action) => {
        const payload = action.payload;
        return state.merge({ error: payload });
    },
    LOGOUT_SUCCESS: () => INITIAL_STATE,
    LOGIN_SUCCESS: (state) => state.set('error', null),
    LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
function* loginSaga({ payload }) {
    try {
        yield api_1.default.post('/login', { body: payload });
        yield effects_1.put(exports.loginSuccess());
        yield effects_1.put(settings_1.refreshSettings());
    }
    catch (e) {
        console.error(e);
        yield effects_1.put(exports.loginFailure(e));
    }
}
exports.loginSaga = loginSaga;
function* logoutSaga() {
    try {
        yield api_1.default.get('/logout');
        yield effects_1.put(settings_1.refreshSettings());
    }
    catch (e) {
        console.error(e);
    }
}
exports.logoutSaga = logoutSaga;
