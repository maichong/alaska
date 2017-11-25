'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Banner extends _alaska.Model {

  preSave() {
    if (!this.startAt) {
      this.startAt = new Date();
    }
    if (!this.endAt) {
      this.endAt = new Date();
    }
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  isValid() {
    let now = new Date();
    return this.activated && this.startAt < now && this.endAt > now;
  }
}
exports.default = Banner;
Banner.label = 'Banner';
Banner.icon = 'picture-o';
Banner.defaultSort = '-sort';
Banner.defaultColumns = 'pic title position sort clicks activated startAt endAt';
Banner.api = {
  list: 1
};

Banner.defaultFilters = ctx => {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true,
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() }
  };
};

Banner.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  pic: {
    label: 'Picture',
    type: 'image'
  },
  position: {
    label: 'Position',
    type: 'select',
    default: 'default',
    options: [{
      label: 'Default',
      value: 'default'
    }]
  },
  action: {
    label: 'Action',
    type: 'select',
    default: 'url',
    options: [{
      label: 'URL',
      value: 'url'
    }]
  },
  url: {
    label: 'URL',
    type: String
  },
  sort: {
    label: 'Sort',
    type: Number,
    default: 0,
    private: true
  },
  clicks: {
    label: 'Clicks',
    type: Number,
    default: 0,
    private: true
  },
  activated: {
    label: 'Activated',
    type: Boolean,
    private: true
  },
  startAt: {
    label: 'Start At',
    type: Date,
    private: true
  },
  endAt: {
    label: 'End At',
    type: Date,
    private: true,
    index: true
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};