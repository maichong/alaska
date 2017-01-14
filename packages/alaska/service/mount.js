// @flow

export default async function mount() {
  this.mount = Promise.resolve();
  const alaska = this.alaska;

  for (let sub of this.serviceList) {
    await sub.mount('mount');
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
