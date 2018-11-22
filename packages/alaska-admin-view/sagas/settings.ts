import { put } from 'redux-saga/effects';
import * as _ from 'lodash';
import akita from 'akita';
import { ObjectMap } from 'alaska';
import { applySettings } from '../redux/settings';
import { applyUser } from '../redux/user';
import parseAbility from '../utils/parse-ability';
import { Settings } from '..';

interface WithAbility {
  ability?: string;
}

function abilityFunction(list: ObjectMap<WithAbility>) {
  _.forEach(list, (item) => {
    if (item.ability && item.ability.startsWith('js:')) {
      // eslint-disable-next-line no-eval
      item.ability = eval(item.ability.substr(3));
    }
  });
}

export default function* settingsSaga() {
  try {
    let settings: Settings = yield akita.get('/settings');

    console.log('settings', settings);
    /*
    let models = {};
    _.forEach(settings.services, (service) => {
      _.forEach(service.models, (model, modelName) => {
        models[model.id] = model;
        for (let key of Object.keys(model.actions)) {
          if (model.actions[key]) {
            model.actions[key].key = key;
          }
        }
        if (model && model.fields) {
          model.serviceId = service.id;
          model.abilities = {};
          let ability = `admin.${model.key}.`.toLowerCase();
          _.forEach(settings.abilities, (can, key) => {
            if (key.indexOf(ability) !== 0) return;
            let name = key.substr(ability.length);
            model.abilities[name] = can;
          });

          abilityFunction(model.actions);
          abilityFunction(model.groups);
          abilityFunction(model.fields);
        }

        function checkAbility(action) {
          let ability = _.get(model, `actions.${action}.ability`);
          if (ability) {
            ability = parseAbility(ability, null, settings.user);
            if (ability && !settings.abilities[ability]) return false;
          } else if (!model.abilities[action]) return false;
          return true;
        }

        model.canCreate = !model.nocreate && checkAbility('create');
        model.canUpdate = !model.noupdate && checkAbility('update');
        model.canRemove = !model.noremove && checkAbility('remove');
        model.canUpdateRecord = function (record: Object) {
          if (model.canUpdate) return true;
          if (model.noupdate) return false;
          let ability = _.get(model, 'actions.update.ability');
          if (ability) {
            ability = parseAbility(ability, record, settings.user);
            if (ability && !settings.abilities[ability]) return false;
          } else if (!model.abilities.update) return false;
          // TODO check action depends / hidden / super
          return true;
        };
        model.canRemoveRecord = function (record: Object) {
          if (model.canRemove) return true;
          if (model.noremove) return false;
          let ability = _.get(model, 'actions.remove.ability');
          if (ability) {
            ability = parseAbility(ability, record, settings.user);
            if (ability && !settings.abilities[ability]) return false;
          } else if (!model.abilities.remove) return false;
          // TODO check action depends / hidden / super
          return true;
        };
        service.models[modelName] = _.cloneDeep(model);
      });
    });

    */

    yield put(applySettings(settings));
    yield put(applyUser(settings.user));
  } catch (e) {
    console.error(e);
  }
}
