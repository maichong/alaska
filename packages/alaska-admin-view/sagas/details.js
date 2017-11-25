'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = details;

var _effects = require('redux-saga/effects');

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _details = require('../redux/details');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fetching = {};

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
    yield (0, _effects.put)((0, _details.applyDetails)(payload.key, res));
  } catch (e) {
    fetching[fetchingKey] = false;
    yield (0, _effects.put)((0, _details.applyDetails)(payload.key, {
      _id: payload.id,
      _error: e.message
    }));
  }
}