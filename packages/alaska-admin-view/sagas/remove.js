import { put } from 'redux-saga/effects';
import qs from 'qs';
import _ from 'lodash';
import akita from '../utils/akita';

export default function* remove(action) {
  try {
    yield akita.post('/api/remove?' + qs.stringify(_.omit(action.payload, 'id')), { id: action.payload.id });
  } catch (e) {
    throw e;
  }
}
