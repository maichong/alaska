// @flow

import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import * as utils from '../utils';

export default async function loadLocales() {
  this.loadLocales = utils.resolved;
  const { alaska } = this;

  for (let sub of this.serviceList) {
    await sub.loadLocales();
  }

  this.debug('loadLocales');

  this.locales = {};

  const { locales } = this;

  const allowed = alaska.main.config('locales', []);

  for (let name of allowed) {
    let file = path.join(__dirname, '../locales/', name, 'messages.js');
    if (utils.isFile(file)) {
      // $Flow
      locales[name] = _.clone(require(file).default);
    }
  }

  function readLocales(dir) {
    if (!utils.isDirectory(dir)) return;
    let names = fs.readdirSync(dir);
    for (let name of names) {
      if (allowed.indexOf(name) > -1) {
        let file = dir + '/' + name + '/messages.js';
        if (utils.isFile(file)) {
          // $Flow
          let messages = require(file).default;
          if (locales[name]) {
            Object.assign(locales[name], messages);
          } else {
            locales[name] = messages;
          }
        }
      }
    }
  }

  readLocales(this.dir + '/locales');
  for (let dir of this._configDirs) {
    readLocales(dir + '/locales');
  }

  Object.keys(locales).forEach((locale) => {
    if (!alaska.locales[locale]) {
      alaska.locales[locale] = {};
    }
    Object.assign(alaska.locales[locale], locales[locale]);
  });
}
