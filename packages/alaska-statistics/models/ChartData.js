'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class ChartData extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = ChartData;
ChartData.label = 'Chart Data';
ChartData.hidden = true;
ChartData.defaultColumns = 'source x y';
ChartData.defaultSort = '-x';
ChartData.fields = {
  source: {
    ref: 'ChartSource',
    index: true,
    required: true
  },
  x: {
    type: Object
  },
  y: {
    type: Number,
    default: 0
  }
};