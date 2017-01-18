/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-30
 * @author Liang <liang@maichong.it>
 */

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
