import { takeLatest, takeEvery } from 'redux-saga/effects';
import { STARTUP } from '../redux/startup';
import { REFRESH_SETTINGS } from '../redux/settings';
import { LOGIN, LOGOUT } from '../redux/login';
import { LOAD_DETAILS } from '../redux/details';
import { LOAD_LIST, LOAD_MORE } from '../redux/lists';
import { ACTION_REQUEST } from '../redux/action';

import detailsSaga from './details';
import listSaga from './list';
import moreSaga from './more';
import settingsSaga from './settings';
import { login, logout } from './login';
import acitonSaga from './action';

// 当action触发时，执行特定saga
export default function* root() {
  yield [
    takeLatest(STARTUP, settingsSaga),
    takeLatest(REFRESH_SETTINGS, settingsSaga),
    takeLatest(LOGIN, login),
    takeLatest(LOGOUT, logout),
    takeEvery(LOAD_DETAILS, detailsSaga),
    takeLatest(LOAD_LIST, listSaga),
    takeLatest(LOAD_MORE, moreSaga),
    takeEvery(ACTION_REQUEST, acitonSaga)
  ];
}
