import path from 'path';

export default {
  prefix: '/admin',
  statics: [{
    root: process.cwd() + '/runtime/alaska-admin-view/build',
    prefix: '/js'
  }, {
    root: path.join(__dirname, '../static'),
    prefix: '/static'
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
  dashboardTitle: 'Alaska admin dashboard'
};
