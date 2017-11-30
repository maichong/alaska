// @flow

import _ from 'lodash';
import * as utils from '../utils';
import defaultLocals from '../locales';

export default async function loadLocales() {
  this.loadLocales = utils.resolved;
  const { alaska } = this;

  for (let sub of this.serviceList) {
    await sub.loadLocales();
  }

  this.debug('loadLocales');

  let serviceModules = this.alaska.modules.services[this.id];

  this.locales = {};

  const { locales } = this;

  _.forEach(serviceModules.locales, (messages, name) => {
    locales[name] = _.assign({}, defaultLocals[name], messages);
  });

  _.forEach(serviceModules.plugins, (plugin) => {
    if (plugin.locales) {
      _.forEach(plugin.locales, (messages, name) => {
        _.assign(locales[name], messages);
      });
    }
  });

  Object.keys(locales).forEach((locale) => {
    if (!alaska.locales[locale]) {
      alaska.locales[locale] = {};
    }
    Object.assign(alaska.locales[locale], locales[locale]);
  });
}
