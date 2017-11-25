'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Sms extends _alaska.Model {

  static preRegister() {
    let locales = _alaska2.default.main.getConfig('locales');

    if (locales && locales.length > 1) {
      let SmsModel = Sms;
      SmsModel.fields.content.help = 'Default';
      locales.forEach(locale => {
        SmsModel.fields['content_' + locale.replace('-', '_')] = {
          label: 'Content',
          type: String,
          multiLine: true,
          help: _2.default.t('lang', locale)
        };
      });
    }
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Sms;
Sms.label = 'SMS';
Sms.icon = 'comment';
Sms.titleField = 'title';
Sms.defaultColumns = '_id title content createdAt';
Sms.defaultSort = '_id';
Sms.fields = {
  _id: {
    type: String,
    required: true
  },
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  driver: {
    label: 'Driver',
    type: 'select',
    options: _2.default.getDriverOptionsAsync()
  },
  content: {
    label: 'Content',
    type: String,
    required: true,
    multiLine: true
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};