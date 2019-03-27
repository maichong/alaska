"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_actions_1 = require("redux-actions");
const storage_1 = require("../utils/storage");
exports.APPLY_LAYOUT = 'APPLY_LAYOUT';
exports.applyLayout = redux_actions_1.createAction(exports.APPLY_LAYOUT);
exports.default = redux_actions_1.handleActions({
    APPLY_LAYOUT: (state, action) => {
        storage_1.setStorage('layout', action.payload);
        return action.payload;
    }
}, (storage_1.getStorage('layout') || 'full'));
