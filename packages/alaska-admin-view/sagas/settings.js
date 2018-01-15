'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = settingsSaga;

var _effects = require('redux-saga/effects');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _settings = require('../redux/settings');

var _user = require('../redux/user');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function abilityFunction(list) {
  _lodash2.default.forEach(list, item => {
    if (item.ability && item.ability.startsWith('js:')) {
      // eslint-disable-next-line no-eval
      item.ability = eval(item.ability.substr(3));
    }
  });
}

// $Flow


function* settingsSaga() {
  try {
    let { settings, user } = yield _akita2.default.get('/api/settings');

    let models = {};
    for (let i of _lodash2.default.keys(settings.services)) {
      let service = settings.services[i];
      if (service && service.models) {
        for (let modelName of Object.keys(service.models)) {
          let model = service.models[modelName];
          models[model.path] = model;
          for (let key of Object.keys(model.actions)) {
            if (model.actions[key]) {
              model.actions[key].key = key;
            }
          }
          if (model && model.fields) {
            model.serviceId = service.id;
            model.abilities = {};
            let ability = `admin.${model.key}.`.toLowerCase();
            _lodash2.default.forEach(settings.abilities, (can, key) => {
              if (key.indexOf(ability) !== 0) return;
              let name = key.substr(ability.length);
              model.abilities[name] = can;
            });

            abilityFunction(model.actions);
            abilityFunction(model.groups);
            abilityFunction(model.fields);
          }
          service.models[modelName] = _lodash2.default.cloneDeep(model);
        }
      }
    }
    let all = {};
    _lodash2.default.forEach(settings.locales, service => {
      _lodash2.default.forEach(service, (locale, key) => {
        if (!all[key]) {
          all[key] = {};
        }
        _lodash2.default.defaults(all[key], locale);
      });
    });
    settings.locales.all = all;
    settings.models = models;

    yield (0, _effects.put)((0, _settings.applySettings)(settings));
    yield (0, _effects.put)((0, _user.applyUser)(user));
  } catch (e) {
    console.error(e);
  }
}