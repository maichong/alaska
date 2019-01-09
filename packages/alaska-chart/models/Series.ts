import { Model } from 'alaska-model';

export default class Series extends Model {
  static hidden = true;

  static fields = {
    title: {
      label: 'Title',
      type: String
    },
    type: {
      label: 'Type',
      type: 'select',
      default: 'line',
      options: [{
        label: 'Line',
        value: 'line'
      }, {
        label: 'Bar',
        value: 'bar'
      }, {
        label: 'Pie',
        value: 'pie'
      }, {
        label: 'Scatter',
        value: 'scatter'
      }, {
        label: 'Effect Scatter',
        value: 'effectScatter'
      }, {
        label: 'Radar',
        value: 'radar'
      }, {
        label: 'Heat Map',
        value: 'heatmap'
      }, {
        label: 'Map',
        value: 'map'
      }, {
        label: 'Funnel',
        value: 'funnel'
      }, {
        label: 'Gauge',
        value: 'gauge'
      }]
    },
    coordinateSystem: {
      label: 'Coordinate System',
      type: 'select',
      switch: true,
      default: 'grid',
      required: true,
      options: [{
        label: 'Grid',
        value: 'grid'
      }, {
        label: 'Polar',
        value: 'polar'
      }, {
        label: 'Geo',
        value: 'geo'
      }],
      hidden: {
        type: {
          $nin: ['scatter', 'effectScatter', 'heatmap']
        }
      }
    },
    keyAxisType: {
      label: 'Key Axis Type',
      type: 'select',
      switch: true,
      default: 'time',
      required: true,
      options: [{
        label: 'Time Line',
        value: 'time'
      }, {
        label: 'Time Cycle',
        value: 'cycle'
      }, {
        label: 'Category',
        value: 'category'
      }, {
        label: 'Number Value',
        value: 'value'
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
      }]
    },
    function: {
      label: 'Function',
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
    model: {
      label: 'Model',
      type: 'model',
      required: true
    },
    keyAxis: {
      label: 'Key Axis Field',
      type: String,
      filter: '',
      cell: '',
      view: 'AxisSelector'
    },
    valueAxis: {
      label: 'Value Axis Field',
      type: String,
      filter: '',
      cell: '',
      view: 'AxisSelector'
    },
    precision: {
      label: 'Precision',
      type: Number,
      default: 0
    },
    limit: {
      label: 'Limit',
      type: Number
    },
    // TODO:
    // filters: {
    //   label: 'Filters',
    //   type: 'filter',
    //   ref: ':model',
    //   disabled: '!model'
    // },
    sort: {
      label: 'Sort',
      type: 'select',
      switch: true,
      options: [{
        label: 'Key Axis Asc',
        value: 'key-asc'
      }, {
        label: 'Key Axis Desc',
        value: 'key-desc'
      }, {
        label: 'Value Axis Asc',
        value: 'value-asc'
      }, {
        label: 'Value Axis Desc',
        value: 'value-desc'
      }]
    },
    options: {
      label: 'Options',
      type: Object
    }
  };

  preSave() {
  }
}
