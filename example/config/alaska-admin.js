export default {
  prefix: '/admin',
  statics: [{
    root: process.cwd() + '/public/admin/js',
    prefix: '/js'
  }, {
    root: process.cwd() + '/node_modules/alaska-admin/static',
    prefix: '/static'
  }]
};
