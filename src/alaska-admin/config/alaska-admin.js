import path from 'path';

export default {
  middlewares: {
    'koa-bodyparser': {
      sort: 1000
    },
    'alaska-middleware-upload': {
      sort: 1000
    }
  },
  renderer: {
    type: 'alaska-renderer-art'
  },
  prefix: '/admin',
  statics: [{
    root: process.cwd() + '/runtime/alaska-admin-view/build',
    prefix: '/js'
  }, {
    root: path.join(__dirname, '../statics'),
    prefix: '/statics'
  }],
  services: {
    'alaska-user': {},
    'alaska-settings': {}
  },
  superMode: false,
  /**
   * run Init sled when every launch
   */
  autoInit: true,
  dashboardTitle: 'Alaska admin dashboard',
  defaultHorizontal: false
};
