'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaUser = require('alaska-user');

var _alaskaUser2 = _interopRequireDefault(_alaskaUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Init extends _alaska.Sled {
  exec() {
    _alaskaUser2.default.run('RegisterAbility', {
      id: 'admin.alaska-balance.withdraw.accept',
      title: 'Accept Withdraw',
      service: 'alaska-admin'
    });
    _alaskaUser2.default.run('RegisterAbility', {
      id: 'admin.alaska-balance.withdraw.reject',
      title: 'Reject Withdraw',
      service: 'alaska-admin'
    });
  }
}
exports.default = Init;