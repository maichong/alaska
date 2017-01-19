export default {
  prefix: '/admin',
  statics: [{
    root: process.cwd() + '/public/admin/js',
    prefix: '/static/js'
  }, {
    root: process.cwd() + '/node_modules/alaska-admin/static/img',
    prefix: '/static/img'
  }]
};
