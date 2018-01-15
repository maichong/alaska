// @flow

import _ from 'lodash';
import { Renderer } from 'alaska';
import artTemplate from 'art-template';
import type { Options } from 'art-template';
import path from 'path';
import fs from 'fs';
import slash from 'slash';

export default class SwigRenderer extends Renderer {
  constructor(service: Alaska$Service, options: Options) {
    options = _.assign({
      loader: (filename) => {
        // $Flow
        let map = this.getFileMap();
        filename = slash(filename);
        let file = map[filename];
        if (!file) {
          file = map[filename + (options.extname || '.art')];
        }
        if (!file) {
          service.panic(`Template file ${service.id}:${filename} is not exists!`);
        }
        return fs.readFileSync(file, 'utf8');
      },
      resolveFilename: (filename, opt) => {
        if (filename === opt.filename) return filename;
        return path.join(opt.filename, '..', filename);
      }
    }, options);
    super(service, options);
  }

  /**
   * 渲染模板文件
   * @param {string} pathName 模板文件路径
   * @param {Object} locals   模板值
   * @returns {Promise<string>}
   */
  renderFile(pathName: string, locals: Object): Promise<string> {
    try {
      let html = artTemplate.compile(_.assign({ filename: pathName }, this.options))(locals);
      return Promise.resolve(html);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 渲染模板
   * @param {string} template 模板代码
   * @param {Object} locals   模板值
   * @returns {string}
   */
  render(template: string, locals: Object): string {
    return artTemplate.render(template, { locals }, _.assign({}, this.options));
  }
}
