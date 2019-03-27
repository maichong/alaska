"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_actions_1 = require("redux-actions");
const immutable = require("seamless-immutable");
exports.APPLY_USER = 'APPLY_USER';
const INITIAL_STATE = immutable({
    id: '',
    displayName: '',
    avatar: ''
});
exports.applyUser = redux_actions_1.createAction(exports.APPLY_USER);
exports.default = redux_actions_1.handleActions({
    APPLY_USER: (state, action) => state.merge(action.payload),
    LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
