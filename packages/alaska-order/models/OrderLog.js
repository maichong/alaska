// @flow

import { Model } from 'alaska';
import service from '../';
import Order from '../models/Order';

export default class OrderLog extends Model {

  static label = 'Order Log';
  static icon = 'hourglass-2';
  static defaultColumns = 'title order createdAt';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noedit = true;
  static noremove = true;

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      translate: true
    },
    order: {
      label: 'Order',
      type: 'relationship',
      ref: 'Order',
      index: true
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
      options: service.config('status')
    },
    createdAt: {
      label: '添加时间',
      type: Date
    }
  };

  title: string;
  order: Order;
  state: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date;
    }
  }
}
