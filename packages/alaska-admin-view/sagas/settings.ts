import { put } from 'redux-saga/effects';
import * as _ from 'lodash';
import akita from 'akita';
import { ObjectMap } from 'alaska';
import { applySettings } from '../redux/settings';
import { applyUser } from '../redux/user';
import { Settings } from '..';

export default function* settingsSaga() {
  try {
    let settings: Settings = yield akita.get('/settings');
    settings.models = {};
    _.forEach(settings.services, (service) => {
      _.forEach(service.models, (model, modelName) => {
        settings.models[model.id] = model;
        for (let key of Object.keys(model.actions)) {
          if (model.actions[key]) {
            model.actions[key].key = key;
          }
        }
        if (model && model.fields) {
          model.serviceId = service.id;
          model.abilities = {};
          let ability = `${model.id}.`;
          _.forEach(settings.abilities, (can, key) => {
            if (key.indexOf(ability) !== 0) return;
            let name = key.substr(ability.length);
            model.abilities[name] = can;
          });
        }

        function checkAbility(action: string): boolean {
          // TODO: URRC
          if (!model.abilities[action]) return false;
          return true;
        }

        model.canCreate = !model.nocreate && checkAbility('create');
        model.canUpdate = !model.noupdate && checkAbility('update');
        model.canRemove = !model.noremove && checkAbility('remove');
        model.canUpdateRecord = function (record: Object) {
          if (model.canUpdate) return true;
          if (model.noupdate) return false;
          // TODO: URRC
          if (!model.abilities.update) return false;
          // TODO: check action depends / hidden / super
          return true;
        };
        model.canRemoveRecord = function (record: Object) {
          if (model.canRemove) return true;
          if (model.noremove) return false;
          // TODO: URRC
          if (!model.abilities.remove) return false;
          // TODO: check action depends / hidden / super
          return true;
        };
      });
    });

    yield put(applySettings(settings));
    yield put(applyUser(settings.user));
  } catch (e) {
    console.error(e);
  }
}
