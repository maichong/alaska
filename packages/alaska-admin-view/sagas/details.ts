import akita from 'akita';
import { Action } from 'redux-actions';
import { LoadDetailsPayload, ApplyDetailsPayload } from 'alaska-admin-view';
import { batchApplyDetails } from '../redux/details';
import store from '../redux';

const fetching: {
  [model: string]: boolean;
} = {};

let queue: ApplyDetailsPayload[] = [];
let timer: number = 0;

export default function* details({ payload }: Action<LoadDetailsPayload>) {
  let fetchingKey = `${payload.model}/${payload.id}`;
  try {
    if (fetching[fetchingKey]) {
      return;
    }
    fetching[fetchingKey] = true;
    let res = yield akita.get('/details', {
      query: {
        _model: payload.model,
        _id: payload.id,
      }
    });
    fetching[fetchingKey] = false;
    queue.push({ model: payload.model, data: res });
  } catch (e) {
    fetching[fetchingKey] = false;
    queue.push({
      model: payload.model,
      data: {
        _id: payload.id,
        _error: e.message
      }
    });
  }
  if (!timer) {
    timer = window.setTimeout(() => {
      timer = 0;
      let cur = queue;
      queue = [];
      if (cur.length) {
        store.dispatch(batchApplyDetails(cur));
      }
    }, 50);
  }
}
