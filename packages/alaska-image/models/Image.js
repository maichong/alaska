'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Image extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Image;
Image.label = 'Image';
Image.icon = 'picture-o';
Image.defaultColumns = 'pic user createdAt';
Image.defaultSort = '-createdAt';
Image.noremove = true;
Image.fields = {
  pic: {
    label: 'Picture',
    type: 'image',
    required: true
  },
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    optional: true
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};