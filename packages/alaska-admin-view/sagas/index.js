import { takeLatest } from 'redux-saga';
import { STARTUP } from '../redux/startup';
import { LOGIN, LOGOUT } from '../redux/login';
import { REFRESH } from '../redux/user';
import { DETAILS } from '../redux/details';
import { LIST } from '../redux/lists';
import { REMOVE, SAVE } from '../redux/save';

import details from './details';
import list from './list';
import { login, logout } from './login';
import refreshInfo from './refreshInfo';
import remove from './remove';
import save from './save';
import startup from './startup';

// 当action触发时，执行特定saga
export default function* root() {
  yield [
    takeLatest(STARTUP, startup),
    takeLatest(LOGIN, login),
    takeLatest(LOGOUT, logout),
    takeLatest(REFRESH, refreshInfo),
    takeLatest(DETAILS, details),
    takeLatest(LIST, list),
    takeLatest(REMOVE, remove),
    takeLatest(SAVE, save)
  ];
}
