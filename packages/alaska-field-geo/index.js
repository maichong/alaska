'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class GeoField extends _alaska.Field {

  init() {
    this.set = function (value) {
      if (Array.isArray(value)) {
        return [parseFloat(value[0]) || 0, parseFloat(value[1] || 0)];
      }
      if (typeof value === 'object') {
        let lng = parseFloat(value.lng) || 0;
        let lat = parseFloat(value.lat) || 0;
        return [lng, lat];
      }
      return [0, 0];
    };
  }
}
exports.default = GeoField;
GeoField.plain = Array;
GeoField.defaultOptions = {
  index: '2dsphere',
  coordinate: 'wgs84',
  cell: 'GeoFieldCell',
  view: 'GeoFieldView'
};