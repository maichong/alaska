import { Model } from 'alaska-model';

export default class Series extends Model {
  static hidden = true;

  static fields = {
    title: {
      label: 'Series Title',
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
    keyParser: {
      label: 'Key Parser',
      type: 'select',
      switch: true,
      default: 'day',
      options: [{
        label: 'Default',
        value: 'default'
      }, {
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
    valueParser: {
      label: 'Value Parser',
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
    source: {
      label: 'Data Source',
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
      view: 'AxisSelector',
      hidden: {
        valueParser: 'count'
      }
    },
    precision: {
      label: 'Precision',
      type: Number,
      default: 0,
      hidden: {
        valueParser: 'count'
      }
    },
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
      }],
      hidden: {
        keyAxisType: {
          $ne: 'category'
        }
      }
    },
    limit: {
      label: 'Limit',
      type: Number,
      hidden: {
        keyAxisType: {
          $ne: 'category'
        }
      }
    },
    filters: {
      label: 'Filters',
      type: Object
    },
    options: {
      label: 'Series Options',
      type: Object
    }
  };

  title: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'effectScatter' | 'radar' | 'heatmap' | 'map' | 'funnel' | 'gauge';
  coordinateSystem: 'grid' | 'polar' | 'geo';
  keyAxisType: 'time' | 'cycle' | 'category' | 'value';
  keyParser: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | string;
  valueParser: 'count' | 'sum' | 'average' | 'min' | 'max' | string;
  source: string;
  keyAxis: string;
  valueAxis?: string;
  precision?: number;
  limit?: number;
  sort?: 'key-asc' | 'key-desc' | 'value-asc' | 'value-desc';
  options?: echarts.EChartOption.Series;
  filters?: any;
}
