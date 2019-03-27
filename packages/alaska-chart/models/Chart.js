"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_model_1 = require("alaska-model");
const utils_1 = require("alaska-model/utils");
const Series_1 = require("./Series");
const __1 = require("..");
const alaska_user_1 = require("alaska-user");
class Chart extends alaska_model_1.Model {
    static async getChartOption(chart, ctx, filters) {
        const xAxis = chart.reverse ? 'yAxis' : 'xAxis';
        const yAxis = chart.reverse ? 'xAxis' : 'yAxis';
        let echartOption = _.defaultsDeep({
            title: {
                text: chart.title || '',
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: []
            },
            [xAxis]: {},
            [yAxis]: {
                type: 'value'
            },
            series: []
        }, chart.options);
        for (let s of chart.series || []) {
            let modelId = s.source;
            let model = alaska_model_1.Model.lookup(modelId);
            if (!model)
                continue;
            if (ctx && !ctx.state.ignoreAuthorization) {
                let abliityFilters = await alaska_user_1.default.createFilters(ctx.user, `${model.id}.read`);
                if (!abliityFilters)
                    continue;
                let userFilters = await model.createFiltersByContext(ctx);
                filters = utils_1.mergeFilters(filters, abliityFilters, userFilters);
            }
            echartOption.legend.data.push(s.title);
            let series = s.options || {};
            series.type = s.type;
            series.name = s.title;
            series.data = await Chart.getSeriesData(chart, s, filters);
            let xAxisType;
            switch (s.keyAxisType) {
                case 'time':
                    xAxisType = 'time';
                    break;
                case 'cycle':
                case 'category':
                    xAxisType = 'category';
                    break;
                case 'value':
                    xAxisType = 'value';
                    break;
            }
            let xAxisOption = echartOption[xAxis];
            if (Array.isArray(xAxisOption)) {
                let index = series.xAxisIndex || 0;
                xAxisOption = xAxisOption[index] || xAxisOption[0];
                if (xAxisOption) {
                    xAxisOption.type = xAxisType;
                }
            }
            else {
                xAxisOption.type = xAxisType;
            }
            echartOption.series.push(series);
        }
        return echartOption;
    }
    static async getSeriesData(chart, series, filters) {
        if (!series.keyAxis)
            return [];
        let keyParser = __1.default.keyParsers.get(series.keyParser);
        let valueParser = __1.default.valueParsers.get(series.valueParser);
        if (!keyParser || !valueParser)
            return [];
        let model = alaska_model_1.Model.lookup(series.source);
        if (!model)
            return [];
        let results = new Map();
        if (series.filters && filters) {
            filters = utils_1.mergeFilters(series.filters, filters);
        }
        else {
            filters = filters || series.filters;
        }
        await model.find(filters).select(`_id ${series.keyAxis} ${series.valueAxis || ''}`).cursor().eachAsync(async (record) => {
            let key = await keyParser({ model, record, results, series, keyField: series.keyAxis });
            let slice;
            if (key && typeof key === 'object' && key.result && key.key) {
                slice = key;
            }
            else {
                slice = results.get(String(key));
                if (!slice) {
                    slice = { keySort: record.get(series.keyAxis) || key, key: String(key), result: [key] };
                    results.set(String(key), slice);
                }
            }
            await valueParser({ model, record, results, series, valueField: series.valueAxis, slice });
        });
        let data = [];
        results.forEach((slice) => {
            data.push(slice);
        });
        if (series.keyAxisType === 'category') {
            switch (series.sort) {
                case 'key-asc':
                    data = _.orderBy(data, ['keySort'], ['asc']);
                    break;
                case 'key-desc':
                    data = _.orderBy(data, ['keySort'], ['desc']);
                    break;
                case 'value-asc':
                    data = _.orderBy(data, ['value'], ['asc']);
                    break;
                case 'value-desc':
                    data = _.orderBy(data, ['value'], ['desc']);
                    break;
            }
            if (series.limit) {
                data = _.slice(data, 0, series.limit);
            }
        }
        if (chart.reverse) {
            return data.map((slice) => {
                if (series.type === 'pie') {
                    return { value: slice.key, name: slice.value };
                }
                return (Array.isArray(slice.value) ? slice.value : [slice.value]).concat(slice.result);
            });
        }
        return data.map((slice) => {
            if (series.type === 'pie') {
                return { name: slice.key, value: slice.value };
            }
            return slice.result.concat(slice.value);
        });
    }
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Chart.label = 'Chart';
Chart.icon = 'line-chart';
Chart.defaultColumns = 'title place sort createdAt';
Chart.defaultSort = '-sort';
Chart.groups = {
    series: {
        title: 'Series',
        panel: false
    },
    review: {
        panel: false
    }
};
Chart.api = {};
Chart.fields = {
    title: {
        label: 'Chart Title',
        type: String,
        required: true
    },
    place: {
        label: 'Place',
        type: String
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    sort: {
        label: 'Sort',
        type: Number
    },
    reverse: {
        label: 'Reverse',
        type: Boolean
    },
    options: {
        label: 'Chart Options',
        type: Object
    },
    series: {
        label: 'Series',
        type: 'subdoc',
        ref: Series_1.default,
        multi: true,
        group: 'series'
    },
    chartPreview: {
        type: String,
        view: 'ChartReview',
        group: 'review'
    }
};
exports.default = Chart;
