'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class PostTag extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = PostTag;
PostTag.label = 'Post Tag';
PostTag.icon = 'tags';
PostTag.defaultColumns = 'title createdAt';
PostTag.defaultSort = 'createdAt';
PostTag.searchFields = 'title';
PostTag.api = {
  list: 1,
  paginate: 1,
  show: 1
};
PostTag.fields = {
  title: {
    label: 'Tag',
    type: String,
    required: true
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};