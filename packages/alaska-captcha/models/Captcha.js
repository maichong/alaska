'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const options = [];
const fields = {};
if (_alaska2.default.hasService('alaska-sms')) {
  options.push({
    label: 'SMS',
    value: 'sms'
  });
  fields.sms = {
    label: 'SMS Template',
    ref: 'alaska-sms.Sms',
    depends: {
      type: 'sms'
    }
  };
}

if (_alaska2.default.hasService('alaska-email')) {
  options.push({
    label: 'Email',
    value: 'email'
  });
  fields.email = {
    label: 'Email Template',
    ref: 'alaska-email.Email',
    depends: {
      type: 'email'
    }
  };
}

class Captcha extends _alaska.Model {

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
Captcha.fields = _extends({
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
    options
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
}, fields);