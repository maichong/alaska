'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = details;

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _details = require('../redux/details');

var _redux = require('../redux');

var _redux2 = _interopRequireDefault(_redux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fetching = {};

let queue = [];
let timer = 0;

function* details({ payload }) {
  let fetchingKey = payload.key + '/' + payload.id;
  try {
    if (fetching[fetchingKey]) {
      return;
    }
    fetching[fetchingKey] = true;
    let res = yield _akita2.default.get('/api/details', {
      params: {
        _service: payload.service,
        _model: payload.model,
        _id: payload.id
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
        _redux2.default.dispatch((0, _details.batchApplyDetails)(cur));
      }
    }, 50);
  }
}