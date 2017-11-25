'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Email extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Email;
Email.label = 'Email';
Email.icon = 'envelope';
Email.titleField = 'title';
Email.defaultColumns = '_id title subject';
Email.defaultSort = '-sort';
Email.searchFields = 'title subject content';
Email.actions = {
  test: {
    title: 'Test Send',
    sled: 'Test',
    style: 'success',
    depends: 'testTo'
  }
};
Email.fields = {
  _id: {
    type: String,
    required: true
  },
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  subject: {
    label: 'Subject',
    type: String
  },
  driver: {
    label: 'Driver',
    type: 'select'
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  testTo: {
    label: 'Test Send To',
    type: String,
    private: true
  },
  testData: {
    label: 'Test Template Variables',
    type: Object,
    private: true,
    default: {}
  },
  content: {
    label: 'Content',
    type: 'html'
  }
};