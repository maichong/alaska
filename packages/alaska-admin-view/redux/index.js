"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const configureStore_1 = require("./configureStore");
const sagas_1 = require("./sagas");
const queryCaches_1 = require("./queryCaches");
const details_1 = require("./details");
const layout_1 = require("./layout");
const lists_1 = require("./lists");
const login_1 = require("./login");
const settings_1 = require("./settings");
const user_1 = require("./user");
const menus_1 = require("./menus");
const action_1 = require("./action");
function createStore() {
    const rootReducer = redux_1.combineReducers({
        queryCaches: queryCaches_1.default,
        login: login_1.default,
        user: user_1.default,
        settings: settings_1.default,
        lists: lists_1.default,
        details: details_1.default,
        layout: layout_1.default,
        menus: menus_1.default,
        action: action_1.default
    });
    return configureStore_1.default(rootReducer, sagas_1.default);
}
const store = createStore();
window.store = store;
exports.default = store;
