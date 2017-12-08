'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Captcha extends _alaska.Model {

  static preRegister() {
    if (_alaska2.default.hasService('alaska-sms')) {
      // $Flow
      this.fields.type.options.push({
        label: 'SMS',
        value: 'sms'
      });
      if (!this.fields.sms) {
        // $Flow
        this.fields.sms = {
          label: 'SMS Template',
          ref: 'alaska-sms.Sms',
          depends: {
            type: 'sms'
          }
        };
      }
    }

    if (_alaska2.default.hasService('alaska-email')) {
      // $Flow
      this.fields.type.options.push({
        label: 'Email',
        value: 'email'
      });
      if (!this.fields.email) {
        // $Flow
        this.fields.email = {
          label: 'Email Template',
          ref: 'alaska-email.Email',
          depends: {
            type: 'email'
          }
        };
      }
    }
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.type === 'sms' && !this.sms) _2.default.error('Please select a sms template');
    if (this.type === 'email' && !this.email) _2.default.error('Please select a email template');
  }
}
exports.default = Captcha;
Captcha.label = 'Captcha';
Captcha.icon = 'lock';
Captcha.titleField = 'title';
Captcha.defaultColumns = '_id title type length sms email';
Captcha.defaultSort = '_id';
Captcha.fields = {
  _id: {
    type: String,
    required: true
  },
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  type: {
    label: 'Type',
    type: 'select',
    default: 'sms',
    options: []
  },
  numbers: {
    label: 'Numbers',
    type: String,
    default: '0123456789'
  },
  letters: {
    label: 'Letters',
    type: String,
    default: 'ABCDEFGHJKMNPQRSTWXYZ'
  },
  length: {
    label: 'Length',
    type: Number,
    default: 6
  },
  lifetime: {
    label: 'Life Time',
    type: Number,
    default: 1800,
    addonAfter: 'seconds'
  }
};