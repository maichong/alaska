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

var _parseAbility = require('../utils/parse-ability');

var _parseAbility2 = _interopRequireDefault(_parseAbility);

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
    let settings = yield _akita2.default.get('/api/settings');

    let models = {};
    _lodash2.default.forEach(settings.services, service => {
      _lodash2.default.forEach(service.models, (model, modelName) => {
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

        function checkAbility(action) {
          let ability = _lodash2.default.get(model, `actions.${action}.ability`);
          if (ability) {
            ability = (0, _parseAbility2.default)(ability, null, settings.user);
            if (ability && !settings.abilities[ability]) return false;
          } else if (!model.abilities[action]) return false;
          return true;
        }

        model.canCreate = !model.nocreate && checkAbility('create');
        model.canUpdate = !model.noupdate && checkAbility('update');
        model.canRemove = !model.noremove && checkAbility('remove');
        model.canUpdateRecord = function (record) {
          if (model.canUpdate) return true;
          if (model.noupdate) return false;
          let ability = _lodash2.default.get(model, 'actions.update.ability');
          if (ability) {
            ability = (0, _parseAbility2.default)(ability, record, settings.user);
            if (ability && !settings.abilities[ability]) return false;
          } else if (!model.abilities.update) return false;
          // TODO check action depends / hidden / super
          return true;
        };
        model.canRemoveRecord = function (record) {
          if (model.canRemove) return true;
          if (model.noremove) return false;
          let ability = _lodash2.default.get(model, 'actions.remove.ability');
          if (ability) {
            ability = (0, _parseAbility2.default)(ability, record, settings.user);
            if (ability && !settings.abilities[ability]) return false;
          } else if (!model.abilities.remove) return false;
          // TODO check action depends / hidden / super
          return true;
        };
        service.models[modelName] = _lodash2.default.cloneDeep(model);
      });
    });
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
    yield (0, _effects.put)((0, _user.applyUser)(settings.user));
  } catch (e) {
    console.error(e);
  }
}