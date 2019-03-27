"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const moment = require("moment");
const ShowcaseItem_1 = require("./ShowcaseItem");
function defaultFilters(ctx) {
    if (ctx.service.id === 'alaska-admin')
        return null;
    return {
        activated: true,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() }
    };
}
class Showcase extends alaska_model_1.Model {
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
Showcase.label = 'Showcase';
Showcase.icon = 'table';
Showcase.defaultColumns = 'title place sort activated startAt endAt';
Showcase.defaultSort = 'place -sort';
Showcase.defaultFilters = defaultFilters;
Showcase.api = {
    paginate: 1,
    list: 1,
    count: 1,
    show: 1
};
Showcase.groups = {
    cellEditor: {
        title: 'Cell Editor'
    }
};
Showcase.fields = {
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
        type: ShowcaseItem_1.default,
        multi: true,
        default: [],
        group: 'cellEditor',
        view: 'ShowcaseEditor',
        filter: '',
        cell: ''
    },
};
exports.default = Showcase;
