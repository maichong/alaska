import { takeLatest } from 'redux-saga/effects';
import { STARTUP } from '../redux/startup';
import { REFRESH_SETTINGS } from '../redux/settings';
import { LOGIN, LOGOUT, LOGIN_SUCCESS } from '../redux/login';
import { DETAILS } from '../redux/details';
import { LOAD_LIST } from '../redux/lists';
import { REMOVE, SAVE } from '../redux/save';

import details from './details';
import listSaga from './list';
import settingsSaga from './settings';
import { login, logout } from './login';
import remove from './remove';
import save from './save';
import startup from './startup';

// 当action触发时，执行特定saga
export default function* root() {
  yield [
    takeLatest(STARTUP, startup),
    takeLatest(REFRESH_SETTINGS, settingsSaga),
    takeLatest(LOGIN_SUCCESS, settingsSaga),
    takeLatest(LOGIN, login),
    takeLatest(LOGOUT, logout),
    takeLatest(DETAILS, details),
    takeLatest(LOAD_LIST, listSaga),
    takeLatest(REMOVE, remove),
    takeLatest(SAVE, save)
  ];
}
