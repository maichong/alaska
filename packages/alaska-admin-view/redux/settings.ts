import * as _ from 'lodash';
import { createAction, handleActions, Action } from 'redux-actions';
import { put } from 'redux-saga/effects';
import * as tr from 'grackle';
import api from '../utils/api';
import { applyUser } from './user';
import { Settings } from '..';

export const APPLY_SETTINGS = 'APPLY_SETTINGS';
export const REFRESH_SETTINGS = 'REFRESH_SETTINGS';
export const LOCALE_SETTING = 'LOCALE_SETTING';

// 初始state
const INITIAL_STATE: Settings = {
  authorized: false,
  user: null,
  icon: '',
  logo: '',
  loginLogo: '',
  copyright: '',
  superMode: false,
  locale: '',
  locales: {},
  services: {},
  models: {},
  abilities: {},
  navItems: [],
  menuItems: []
};

export const applySettings = createAction(APPLY_SETTINGS);
export const refreshSettings = createAction(REFRESH_SETTINGS);
export const localeSetting = createAction(LOCALE_SETTING, (locale: string) => ({ locale }));

export default handleActions({
  APPLY_SETTINGS: (state, action) => {
    let settings: Settings = action.payload;
    tr.setLocale(settings.locale);
    _.forEach(settings.locales, (langGroup, serviceId) => {
      tr.learn(langGroup, serviceId === 'alaska-admin' ? '' : serviceId);
    });
    return settings;
  },
  LOCALE_SETTING: (state: Settings, action) => {
    let locale: string = action.payload.locale;
    tr.setLocale(locale);
    return Object.assign({}, state, { locale });
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);

export function* settingsSaga() {
  try {
    let settings: Settings = yield api.get('/settings');
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
          // TODO: check action / hidden / super
          return true;
        };
        model.canRemoveRecord = function (record: Object) {
          if (model.canRemove) return true;
          if (model.noremove) return false;
          // TODO: URRC
          if (!model.abilities.remove) return false;
          // TODO: check action hidden / super
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
