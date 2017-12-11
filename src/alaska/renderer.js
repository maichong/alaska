// @flow

/* eslint no-empty:0 */

import fs from 'fs';
import _ from 'lodash';
import * as utils from './utils';

function readDir(dir: string): Object {
  let map = {};
  try {
    let files: string[] = fs.readdirSync(dir);
    for (let name of files) {
      if (name[0] === '.') {
        continue;
      }
      map[name] = dir + '/' + name;
      if (utils.isDirectory(map[name])) {
        map[name] = readDir(map[name]);
      }
    }
  } catch (err) {
  }
  return map;
}

function objectToMap(obj: Object, path?: string, map?: { [file: string]: string }): { [file: string]: string } {
  path = path ? path + '/' : '';
  map = map || {};
  for (let key of Object.keys(obj)) {
    let p = path + key;
    let value = obj[key];
    if (typeof value === 'object') {
      objectToMap(value, p, map);
    } else {
      map[p] = value;
    }
  }
  return map;
}

export default class Renderer {
  static classOfRenderer = true;
  instanceOfRenderer: true;
  service: Alaska$Service;
  options: Alaska$Config$renderer;
  _map: { [file: string]: string };

  constructor(service: Alaska$Service, options: Alaska$Config$renderer) {
    this.service = service;
    this.options = options || {};
    this.instanceOfRenderer = true;

    if (process.env.NODE_ENV !== 'production') {
      this.options.cache = false;
    }
  }

  /**
   * 获取模板文件映射
   * @returns {*}
   */
  getFileMap(): { [file: string]: string } {
    if (this.options.cache && this._map) {
      return this._map;
    }

    let files = {};
    _.forEach(this.service.templatesDirs, (dir) => {
      files = _.defaultsDeep({}, readDir(dir), files);
    });

    this._map = objectToMap(files);
    return this._map;
  }

  renderFile: (pathName: string, locals: Object) => Promise<string>;
  render: (template: string, locals: Object) => string;
}
