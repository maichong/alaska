// @flow

import { put } from 'redux-saga/effects';
import { refreshSettings } from '../redux/settings';

export default function* startupSaga() {
  yield put(refreshSettings());
}
