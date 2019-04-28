"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effects_1 = require("redux-saga/effects");
const startup_1 = require("./startup");
const settings_1 = require("./settings");
const login_1 = require("./login");
const details_1 = require("./details");
const lists_1 = require("./lists");
const action_1 = require("./action");
const refresh_1 = require("./refresh");
function* rootSaga() {
    yield effects_1.all([
        effects_1.takeLatest([startup_1.STARTUP, settings_1.REFRESH_SETTINGS], settings_1.settingsSaga),
        effects_1.takeLatest(refresh_1.REFRESH, settings_1.settingsSaga),
        effects_1.takeLatest(login_1.LOGIN, login_1.loginSaga),
        effects_1.takeLatest(login_1.LOGOUT, login_1.logoutSaga),
        effects_1.takeEvery(details_1.LOAD_DETAILS, details_1.detailsSaga),
        effects_1.takeEvery(lists_1.LOAD_LIST, lists_1.listSaga),
        effects_1.takeLatest(lists_1.LOAD_MORE, lists_1.moreSaga),
        effects_1.takeEvery(action_1.ACTION_REQUEST, action_1.actionSaga)
    ]);
}
exports.default = rootSaga;
