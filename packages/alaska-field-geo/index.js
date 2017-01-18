// @flow

import { Field } from 'alaska';

export default class GeoField extends Field {
  static options: any[] = [];

  static views: Object = {
    cell: {
      name: 'GeoFieldCell',
      path: `${__dirname}/lib/cell.js`
    },
    view: {
      name: 'GeoFieldView',
      path: `${__dirname}/lib/view.js`
    }
  };
  static plain = Array;
  static viewOptions: any[] = [];

  coordinate: string;

  init() {
    let field = this;
    // $Flow 2dsphere 不知道有什么具体作用 但类型不匹配
    field.index = field.index || '2dsphere';
    field.coordinate = field.coordinate || 'wgs84'; // wgs84 gcj02 bd09

    //const errorMsg = `Cannot cast data to geo type, at ${field._model.name}.${field.path}`;

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
