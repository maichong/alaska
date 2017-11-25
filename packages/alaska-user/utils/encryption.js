'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Encryption {

  constructor(password) {
    this.key = _crypto2.default.createHash('sha256').update(password).digest();
    this.iv = this.key.slice(0, 16);
  }

  encrypt(buf) {
    let cipher = _crypto2.default.createCipheriv('aes-256-cfb', this.key, this.iv);
    // $Flow
    return Buffer.concat([cipher.update(buf), cipher.final()]);
  }

  decrypt(buf) {
    let cipher = _crypto2.default.createDecipheriv('aes-256-cfb', this.key, this.iv);
    return Buffer.concat([cipher.update(buf), cipher.final()]);
  }

  hash(input) {
    return _crypto2.default.createHash('sha256').update(input).digest('base64');
  }
}
exports.default = Encryption;