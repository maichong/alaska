'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Favorite extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Favorite;
Favorite.label = 'Favorite';
Favorite.icon = 'heart';
Favorite.defaultColumns = 'pic title user sort createdAt';
Favorite.defaultSort = '-sort';
Favorite.api = {
  list: 3,
  create: 3,
  remove: 3
};
Favorite.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  pic: {
    label: 'Picture',
    type: 'image'
  },
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    index: true
  },
  type: {
    //手长目标的模型,例如 alaska-goods.Goods
    label: 'Type',
    type: 'select',
    //options:[{label:'Goods',type:'alaska-goods.Goods'}]
    options: []
  },
  target: {
    //收藏目标记录的ID
    label: 'Target',
    type: String
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};