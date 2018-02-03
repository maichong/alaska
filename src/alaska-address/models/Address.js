// @flow

import { Model } from 'alaska';

export default class Address extends Model<Address> {
  static label = 'Address';
  static icon = 'map-marker';
  static titleField = 'name';
  static defaultColumns = 'user name tel geo province city createdAt';
  static defaultSort = '-createdAt';
  static api = {
    create: 3,
    list: 3,
    update: 3,
    remove: 3
  };

  static fields = {
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
  user: Object;
  name: string;
  tel: string;
  zip: string;
  geo: [number, number];
  country: string;
  province: string;
  city: string;
  district: string;
  street: string;
  building: string;
  detail: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
