// @flow

/* eslint import/no-extraneous-dependencies:0 */
/* eslint import/no-unresolved:0 */
/* eslint import/extensions:0 */

import { Renderer } from 'alaska';
// $Flow
import { Swig } from 'swig';
import path from 'path';
import fs from 'fs';
import slash from 'slash';

//const Swig = swig.Swig;

export default class SwigRenderer extends Renderer {
  swig: Swig;

  constructor(service: Alaska$Service, options: Alaska$Config$renderer) {
    super(service, options);

    let me = this;
    let swigOptions = {};
    swigOptions.loader = {
      resolve(to, from) {
        if (to[0] === '/' || !from) {
          return to;
        }
        let map = me.getFileMap();
        if (map[from]) {
          return path.join(from, '..', to);
        }
        return path.join(from, to);
      },
      load(identifier, cb) {
        identifier = slash(identifier);
        let map = me.getFileMap();
        let file = map[identifier];
        if (!file) {
          file = map[identifier + '.swig'];
        }
        if (!file) {
          me.service.panic(`Template file ${service.id}:${identifier} is not exists!`);
        }
        if (!cb) {
          return fs.readFileSync(file, 'utf8');
        }
        return fs.readFile(file, 'utf8', cb);
      }
    };

    this.swig = new Swig(Object.assign({}, this.options, swigOptions));
  }

  /**
   * 渲染模板文件
   * @param {string} pathName 模板文件路径
   * @param {Object} locals   模板值
   * @returns {Promise<string>}
   */
  renderFile(pathName: string, locals: Object): Promise<string> {
    return new Promise((resolve, reject) => {
      this.swig.renderFile(pathName, locals, (error, output) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    });
  }

  /**
   * 渲染模板
   * @param {string} template 模板代码
   * @param {Object} locals   模板值
   * @returns {string}
   */
  render(template: string, locals: Object): string {
    return this.swig.render(template, { locals });
  }
}
