// @flow

import * as utils from '../utils';

export default async function mount() {
  this.mount = utils.resolved;
  const { alaska } = this;

  for (let sub of this.serviceList) {
    await sub.mount('mount');
  }

  const domain = this.config('domain', '', true) || '';
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
}
