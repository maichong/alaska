'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = list;

var _effects = require('redux-saga/effects');

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _lists = require('../redux/lists');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function* list({ payload }) {
  try {
    let res = yield (0, _akita2.default)('/api/list').find(payload.filters).param('service', payload.service).param('model', payload.model).search(payload.search).sort(payload.sort).limit(payload.limit).page(payload.page);
    yield (0, _effects.put)((0, _lists.applyList)(payload.key, res));
  } catch (e) {
    yield (0, _effects.put)((0, _lists.loadListFailure)(payload.key, e));
  }
}