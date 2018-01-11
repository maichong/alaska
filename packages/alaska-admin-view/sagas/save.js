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
    if (Array.isArray(res)) {
      // 同时保存了多条记录
      let list = res.map(data => ({ key: payload.key, data }));
      yield (0, _effects.put)((0, _details.batchApplyDetails)(list));
    } else {
      // 只保存了一条记录
      yield (0, _effects.put)((0, _details.applyDetails)(payload.key, res));
      if (!payload.data.id) {
        // 新建，需要清空列表
        yield (0, _effects.put)((0, _lists.clearList)(payload.key));
      }
    }
  } catch (e) {
    yield (0, _effects.put)((0, _save.saveFailure)(payload, e));
  }
}