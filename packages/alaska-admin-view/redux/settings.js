import { handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

function settingsReducer(state = {}, action) {
  let settings = action.payload.settings || {};
  let models = settings.models = {};
  for (let i of Object.keys(settings.services)) {
    let service = settings.services[i];
    if (service && service.models) {
      for (let j of Object.keys(service.models)) {
        let model = service.models[j];
        models[model.path] = model;
        for (let key of Object.keys(model.actions)) {
          if (model.actions[key]) {
            model.actions[key].key = key;
          }
        }
        if (model && model.fields) {
          model.service = service;
          model.abilities = {};
          let ability = `admin.${model.key}.`.toLowerCase();
          _.forEach(settings.abilities, (can, key) => {
            if (key.indexOf(ability) !== 0) return;
            let name = key.substr(ability.length);
            model.abilities[name] = can;
          });
        }
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

  return state.merge(settings);
}

// 初始state
export const INITIAL_STATE = immutable({
  locales: {
    all: {}
  }
});

export default handleActions({
  UPDATE_SETTINGS: settingsReducer
}, INITIAL_STATE);
