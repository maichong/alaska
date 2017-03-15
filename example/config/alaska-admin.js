export default {
  prefix: '/admin',
  statics: [{
    root: process.cwd() + '/public/admin',
    prefix: '/'
  }, {
    root: process.cwd() + '/node_modules/alaska-admin/static',
    prefix: '/static'
  }]
};
