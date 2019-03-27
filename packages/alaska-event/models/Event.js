"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Event extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Event.label = 'Event';
Event.icon = 'bell';
Event.titleField = 'title';
Event.searchFields = 'title';
Event.defaultColumns = 'pic title user type top parent read createdAt';
Event.filterFields = 'top user from type createdAt?range';
Event.defaultSort = '-createdAt';
Event.populations = {
    from: {
        select: ':tiny'
    }
};
Event.api = {
    list: 3,
    count: 3,
    paginate: 3,
    show: 3,
    remove: 3
};
Event.fields = {
    pic: {
        label: 'Picture',
        type: 'image'
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        index: true,
        required: true
    },
    from: {
        label: 'From',
        type: 'relationship',
        ref: 'alaska-user.User'
    },
    type: {
        label: 'Type',
        type: 'select',
        default: '',
        options: [{
                label: 'Default',
                value: ''
            }]
    },
    level: {
        label: 'Level',
        type: 'select',
        number: true,
        checkbox: true,
        default: 0,
        options: [{
                label: 'Normal',
                value: 0,
                style: 'info'
            }, {
                label: 'Important',
                value: 1,
                style: 'warning'
            }, {
                label: 'Exigency',
                value: 2,
                style: 'danger'
            }]
    },
    top: {
        label: 'Top',
        type: Boolean,
        default: false
    },
    parent: {
        label: 'Parent Event',
        type: 'relationship',
        ref: 'Event'
    },
    content: {
        label: 'Content',
        type: String,
        multiLine: true
    },
    info: {
        label: 'Event Info',
        type: Object,
        default: {}
    },
    read: {
        label: 'Read',
        type: Boolean,
        default: false
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Event;
