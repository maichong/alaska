import { takeLatest, takeEvery, all } from 'redux-saga/effects';
import { STARTUP } from './startup';
import { REFRESH_SETTINGS, settingsSaga } from './settings';
import { LOGIN, LOGOUT, loginSaga, logoutSaga } from './login';
import { LOAD_DETAILS, detailsSaga } from './details';
import { LOAD_LIST, LOAD_MORE, listSaga, moreSaga } from './lists';
import { ACTION_REQUEST, actionSaga } from './action';
import { REFRESH } from './refresh';

// 当action触发时，执行特定saga
export default function* rootSaga() {
  yield all([
    takeLatest([STARTUP, REFRESH_SETTINGS], settingsSaga),
    takeLatest(REFRESH, settingsSaga),
    takeLatest(LOGIN, loginSaga),
    takeLatest(LOGOUT, logoutSaga),
    takeEvery(LOAD_DETAILS, detailsSaga),
    takeEvery(LOAD_LIST, listSaga),
    takeLatest(LOAD_MORE, moreSaga),
    takeEvery(ACTION_REQUEST, actionSaga)
  ]);
}
