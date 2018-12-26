import { Model } from 'alaska-model';
import { Context } from 'alaska-http';
import * as moment from 'moment';
import { ShowcaseItem } from '..';
import ShowcaseItemModel from './ShowcaseItem';

function defaultFilters(ctx: Context) {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true,
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() }
  };
}

export default class Showcase extends Model {
  static label = 'Showcase';
  static icon = 'table';
  static defaultColumns = 'title place sort activated startAt endAt';
  static defaultSort = 'place -sort';
  static defaultFilters = defaultFilters;

  static api = {
    paginate: 1,
    list: 1,
    count: 1,
    show: 1
  };

  static groups = {
    cellEditor: {
      title: 'Cell Editor'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    place: {
      label: 'Place',
      type: 'select',
      switch: true,
      default: 'home',
      options: [{
        label: 'Home',
        value: 'home'
      }]
    },
    className: {
      label: 'Style Class',
      type: String
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    layout: {
      label: 'Layout',
      type: String,
      default: '1-1',
      view: 'ShowcaseLayoutSelector',
      filter: '',
      cell: ''
    },
    height: {
      label: 'Height',
      type: Number,
      default: 300
    },
    width: {
      label: 'Width',
      type: Number,
      default: 750
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
      protected: true
    },
    startAt: {
      label: 'Start At',
      type: Date,
      hidden: '!activated',
      protected: true
    },
    endAt: {
      label: 'End At',
      type: Date,
      hidden: '!activated',
      protected: true,
      index: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      hidden: '!createdAt',
      protected: true
    },
    items: {
      label: 'Items',
      type: ShowcaseItemModel,
      multi: true,
      default: [] as any[],
      group: 'cellEditor',
      view: 'ShowcaseEditor',
      filter: '',
      cell: ''
    },
  };

  title: string;
  place: string;
  layout: string;
  height: number;
  width: number;
  sort: number;
  activated: boolean;
  items: ShowcaseItem[];
  startAt: Date;
  endAt: Date;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.startAt) {
      this.startAt = new Date();
    }
    if (!this.endAt) {
      this.endAt = moment(this.startAt).add(1, 'year').endOf('year').toDate();
    }
  }

  isValid() {
    let now = new Date();
    return this.activated && this.startAt < now && this.endAt > now;
  }
}
