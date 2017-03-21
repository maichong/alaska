// @flow

import { put } from 'redux-saga/effects';
import _ from 'lodash';
import akita from 'akita';
import { applySettings } from '../redux/settings';
import { applyUser } from '../redux/user';

// $Flow
export default function* settingsSaga() {
  try {
    let res = yield akita.get('/api/settings');
    let settings = res.settings;

    let models = {};
    for (let i of _.keys(settings.services)) {
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
            _.forEach(settings.abilities, (can, key) => {
              if (key.indexOf(ability) !== 0) return;
              let name = key.substr(ability.length);
              model.abilities[name] = can;
            });
          }
          service.models[modelName] = _.cloneDeep(model);
        }
      }
    }
    let all = {};
    _.forEach(settings.locales, (service) => {
      _.forEach(service, (locale, key) => {
        if (!all[key]) {
          all[key] = {};
        }
        _.defaults(all[key], locale);
      });
    });
    settings.locales.all = all;
    settings.models = models;

    yield put(applySettings(settings));
    yield put(applyUser(res.user));
  } catch (e) {
    console.error(e);
  }
}
