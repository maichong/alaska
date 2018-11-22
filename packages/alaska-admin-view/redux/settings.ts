import * as _ from 'lodash';
import {
  createAction,
  handleActions
} from 'redux-actions';
import * as tr from 'grackle';
import { Settings } from '..';

export const APPLY_SETTINGS = 'APPLY_SETTINGS';
export const REFRESH_SETTINGS = 'REFRESH_SETTINGS';
export const LOCALE_SETTING = 'LOCALE_SETTING';

// 初始state
export const INITIAL_STATE: Settings = {
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
      tr.learn(langGroup, serviceId);
    });
    return settings;
  },
  LOCALE_SETTING: (state: Settings, action) => {
    let locale: string = action.payload.locale;
    let newState = Object.assign({}, state, { locale });
    // state.locale = locale;
    tr.setLocale(locale);
    _.forEach(state.locales, (langGroup, serviceId) => {
      tr.learn(langGroup, serviceId);
    });
    return newState;
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
