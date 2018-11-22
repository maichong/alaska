import { put } from 'redux-saga/effects';
import akita from 'akita';
import { Action } from 'redux-actions';
import { LoginPayload } from 'alaska-admin-view';
import { loginSuccess, loginFailure } from '../redux/login';
import { refreshSettings } from '../redux/settings';

export function* login({ payload }: Action<LoginPayload>) {
  try {
    yield akita.post('/login', { body: payload });
    yield put(loginSuccess());
    yield put(refreshSettings());
  } catch (e) {
    console.error(e);
    yield put(loginFailure(e));
  }
}

export function* logout() {
  try {
    yield akita.get('/logout');
    yield put(refreshSettings());
  } catch (e) {
    console.error(e);
  }
}
