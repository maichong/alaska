'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Address extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Address;
Address.label = 'Address';
Address.icon = 'map-marker';
Address.titleField = 'name';
Address.defaultColumns = 'user name tel geo province city createdAt';
Address.defaultSort = '-createdAt';
Address.api = {
  create: 3,
  list: 3,
  update: 3,
  remove: 3
};
Address.fields = {
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    required: true,
    private: true
  },
  name: {
    label: 'Name',
    type: String,
    default: ''
  },
  tel: {
    label: 'Tel',
    type: String
  },
  zip: {
    label: 'ZIP Code',
    type: String
  },
  geo: {
    label: 'GEO',
    type: 'geo'
  },
  country: {
    label: 'Country',
    type: String
  },
  province: {
    label: 'Province',
    type: String
  },
  city: {
    label: 'City',
    type: String
  },
  district: {
    label: 'District',
    type: String
  },
  street: {
    label: 'Street',
    type: String
  },
  building: {
    label: 'Building',
    type: String
  },
  detail: {
    label: 'Detail',
    type: String
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};