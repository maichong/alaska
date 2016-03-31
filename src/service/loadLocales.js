/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-31
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

export default async function loadLocales() {
  this.loadLocales = util.noop;
  const alaska = this.alaska;

  for (let s of this._services) {
    await s.loadLocales();
  }

  const locales = this._locales = {};

  const allowed = alaska.main.config('locales', []);

  for (let name of allowed) {
    let file = path.join(__dirname, '../locales/', name, 'messages.js');
    if (util.isFile(file)) {
      locales[name] = _.clone(require(file).default);
    }
  }

  function readLocales(dir) {
    if (!util.isDirectory(dir)) {
      return;
    }
    let names = fs.readdirSync(dir);
    for (let name of names) {
      if (allowed.indexOf(name) === -1) {
        //不允许的语言,直接跳过
        continue;
      }
      let file = dir + '/' + name + '/messages.js';
      if (!util.isFile(file)) {
        continue;
      }
      let messages = require(file).default;
      if (locales[name]) {
        _.assign(locales[name], messages);
      } else {
        locales[name] = messages;
      }
    }
  }

  readLocales(this.dir + '/locales');
  for (let dir of this._configDirs) {
    readLocales(dir + '/locales');
  }
}
