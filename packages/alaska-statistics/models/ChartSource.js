'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ChartSource extends _alaska.Model {

  preSave() {
    if (!this.unit && ['time', 'cycle'].indexOf(this.type) > -1) {
      _alaska2.default.error('Unit is required!');
    }

    if (!this.x && ['count', 'sum', 'average', 'min', 'max'].indexOf(this.reducer) > -1) {
      _alaska2.default.error('X Axis is required!');
    }

    if (!this.y && ['sum', 'min', 'max', 'average'].indexOf(this.reducer) > -1) {
      _alaska2.default.error('Y Axis is required!');
    }

    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.title) {
      this.title = this.model;
    }
    if (this.x && this.type === 'enum') {
      let ServiceModel = _3.default.getModel(this.model);
      let field = ServiceModel.fields[this.x];
      if (!field) _3.default.error('X Axis field is not exist!');
      if (field.options) {
        let map = {};
        _lodash2.default.forEach(field.options, opt => {
          map[String(opt.value)] = opt.label;
        });
        this.xLabelMap = map;
      }
    }
  }

  postRemove() {
    const ChartData = _3.default.getModel('ChartData');
    ChartData.remove({ source: this._id }).exec();
  }

  // $Flow TODO
  async getXLabel(label) {
    let xLabelMap = this.xLabelMap || {};
    if (xLabelMap[label]) {
      return xLabelMap[label] || '';
    }

    let ServiceModel = _3.default.getModel(this.model);
    let field = ServiceModel.fields[this.x];
    if (field && field.ref) {
      let Ref = field.ref;
      // $Flow findById
      let record = await Ref.findById(label).select(Ref.title);
      let title = label;
      if (record) {
        // $Flow Ref有可能为string和[string]
        title = record.get(Ref.titleField || '') || label;
      }
      xLabelMap[label] = title;
      this.xLabelMap = xLabelMap;
      this.markModified('xLabelMap');
      this.save();
      return title;
    }
    return label;
  }
}
exports.default = ChartSource;
ChartSource.label = 'Chart Source';
ChartSource.icon = 'database';
ChartSource.titleField = 'title';
ChartSource.defaultColumns = 'title type reducer unit model autoBuild createdAt';
ChartSource.defaultSort = '-createdAt';
ChartSource.actions = {
  build: {
    title: 'Build Data',
    sled: 'BuildData',
    style: 'success',
    depends: '_id'
  }
};
ChartSource.fields = {
  title: {
    label: 'Title',
    type: String
  },
  type: {
    label: 'Type',
    type: 'select',
    switch: true,
    default: 'time',
    required: true,
    options: [{
      label: 'Time Line',
      value: 'time'
    }, {
      label: 'Cycle',
      value: 'cycle'
    }, {
      label: 'Enum',
      value: 'enum'
    }]
  },
  reducer: {
    label: 'Reducer',
    type: 'select',
    switch: true,
    default: 'count',
    required: true,
    options: [{
      label: 'Count',
      value: 'count'
    }, {
      label: 'Sum',
      value: 'sum'
    }, {
      label: 'Average',
      value: 'average'
    }, {
      label: 'Min',
      value: 'min'
    }, {
      label: 'Max',
      value: 'max'
    }]
  },
  unit: {
    label: 'Unit',
    type: 'select',
    switch: true,
    options: [{
      label: 'Year',
      value: 'year',
      depends: {
        type: 'time'
      }
    }, {
      label: 'Quarter',
      value: 'quarter'
    }, {
      label: 'Month',
      value: 'month'
    }, {
      label: 'Week',
      value: 'week'
    }, {
      label: 'Day',
      value: 'day'
    }, {
      label: 'Hour',
      value: 'hour'
    }, {
      label: 'Minute',
      value: 'minute',
      depends: {
        type: 'time'
      }
    }],
    depends: {
      type: {
        $ne: 'enum'
      }
    }
  },
  model: {
    label: 'Model',
    type: 'select',
    required: true,
    options: []
  },
  x: {
    label: 'X Axis',
    type: String,
    view: 'AxisSelector',
    filter: false,
    disabled: {
      reducer: {
        $nin: ['count', 'sum', 'min', 'max', 'average']
      }
    }
  },
  y: {
    label: 'Y Axis',
    type: String,
    view: 'AxisSelector',
    filter: false,
    disabled: {
      reducer: {
        $nin: ['sum', 'min', 'max', 'average']
      }
    }
  },
  precision: {
    label: 'Y Axis Precision',
    type: Number,
    default: 0,
    depends: {
      reducer: {
        $in: ['average', 'sum']
      }
    }
  },
  sort: {
    label: 'Sort',
    type: 'select',
    switch: true,
    options: [{
      label: 'X Axis Asc',
      value: 'x'
    }, {
      label: 'X Axis Desc',
      value: '-x'
    }, {
      label: 'Y Axis Asc',
      value: 'y'
    }, {
      label: 'Y Axis Desc',
      value: '-y'
    }]
  },
  limit: {
    label: 'Limit',
    type: Number
  },
  filters: {
    label: 'Filters',
    type: 'filter',
    ref: ':model',
    depends: 'model'
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  nextAt: {
    label: 'Next At',
    type: Date,
    hidden: true
  },
  autoBuild: {
    label: 'Auto Build',
    type: 'select',
    number: true,
    switch: true,
    default: 0,
    options: [{
      label: 'Disabled',
      value: 0
    }, {
      label: 'Day',
      value: 86400 * 1000
    }, {
      label: 'Hour',
      value: 3600 * 1000
    }, {
      label: 'Minute',
      value: 60 * 1000
    }]
  },
  xLabelMap: {
    type: Object,
    hidden: true
  }
};