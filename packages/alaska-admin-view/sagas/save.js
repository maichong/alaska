'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = saveSaga;

var _effects = require('redux-saga/effects');

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _save = require('../redux/save');

var _details = require('../redux/details');

var _lists = require('../redux/lists');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function* saveSaga({ payload }) {
  try {
    let res = yield _akita2.default.post('/api/save', {
      params: {
        _service: payload.service,
        _model: payload.model
      },
      body: payload.data
    });
    yield (0, _effects.put)((0, _save.saveSuccess)(payload, res));
    yield (0, _effects.put)((0, _details.applyDetails)(payload.key, res));
    yield (0, _effects.put)((0, _lists.clearList)(payload.key));
  } catch (e) {
    yield (0, _effects.put)((0, _save.saveFailure)(payload, e));
  }
}