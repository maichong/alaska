'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Init extends _alaska.Sled {
  async exec() {
    _alaskaSettings2.default.register({
      id: 'user.closeRegister',
      title: 'Close Register',
      service: 'alaska-user',
      type: 'CheckboxFieldView'
    });

    _alaskaSettings2.default.register({
      id: 'user.closeRegisterReason',
      title: 'Close Register Reason',
      service: 'alaska-user',
      type: 'TextFieldView'
    });
  }
}
exports.default = Init;