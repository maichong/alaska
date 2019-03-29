"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class GeoField extends alaska_model_1.Field {
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
    parse(value) {
        if (Array.isArray(value)) {
            return [parseFloat(value[0]) || 0, parseFloat(value[1] || 0)];
        }
        if (typeof value === 'object') {
            let lng = parseFloat(value.lng) || 0;
            let lat = parseFloat(value.lat) || 0;
            return [lng, lat];
        }
        return [0, 0];
    }
}
GeoField.fieldName = 'Geo';
GeoField.plainName = 'geo';
GeoField.plain = Array;
GeoField.defaultOptions = {
    index: '2dsphere',
    coordinate: 'wgs84',
    cell: 'GeoFieldCell',
    view: 'GeoFieldView'
};
exports.default = GeoField;
