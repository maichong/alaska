import akita from 'akita';
import { batchApplyDetails } from '../redux/details';
import store from '../redux';

const fetching = {};

let queue = [];
let timer = 0;

export default function* details({ payload }) {
  let fetchingKey = payload.key + '/' + payload.id;
  try {
    if (fetching[fetchingKey]) {
      return;
    }
    fetching[fetchingKey] = true;
    let res = yield akita.get('/api/details', {
      params: {
        _service: payload.service,
        _model: payload.model,
        _id: payload.id,
      }
    });
    fetching[fetchingKey] = false;
    queue.push({ key: payload.key, data: res });
  } catch (e) {
    fetching[fetchingKey] = false;
    queue.push({
      key: payload.key,
      data: {
        _id: payload.id,
        _error: e.message
      }
    });
  }
  if (!timer) {
    timer = setTimeout(() => {
      timer = 0;
      let cur = queue;
      queue = [];
      if (cur.length) {
        store.dispatch(batchApplyDetails(cur));
      }
    }, 50);
  }
}
