import { takeLatest, takeEvery } from 'redux-saga/effects';
import { STARTUP } from '../redux/startup';
import { REFRESH_SETTINGS } from '../redux/settings';
import { LOGIN, LOGOUT } from '../redux/login';
import { LOAD_DETAILS } from '../redux/details';
import { LOAD_LIST } from '../redux/lists';
import { SAVE } from '../redux/save';

import detailsSaga from './details';
import listSaga from './list';
import settingsSaga from './settings';
import { login, logout } from './login';
import saveSaga from './save';

// 当action触发时，执行特定saga
export default function* root() {
  yield [
    takeLatest(STARTUP, settingsSaga),
    takeLatest(REFRESH_SETTINGS, settingsSaga),
    takeLatest(LOGIN, login),
    takeLatest(LOGOUT, logout),
    takeEvery(LOAD_DETAILS, detailsSaga),
    takeLatest(LOAD_LIST, listSaga),
    takeEvery(SAVE, saveSaga)
  ];
}
