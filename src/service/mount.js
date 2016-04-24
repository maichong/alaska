/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-05
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function mount() {
  this.mount = util.resolved;
  const alaska = this.alaska;

  for (let s of this._services) {
    await s.mount('mount');
  }

  const domain = this.config(true, 'domain') || '';
  let prefix = this.config('prefix');
  if (prefix === false) return;
  this.debug('mount');
  if (!prefix) {
    prefix = '';
  }

  if (!prefix.endsWith('/')) {
    prefix += '/';
  }

  let point = domain + prefix;
  if (alaska._mounts[point]) {
    throw new Error(`Service mount error at ${point}, ${this.id} conflict to ${alaska._mounts[point].id}`);
  }
  alaska._mounts[point] = this;
  this.domain = domain;
  this.prefix = prefix;
  this.routes = this.router.routes();
};
