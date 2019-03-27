"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.default = {
    groups: {
        props: {
            title: 'Goods Properties',
            after: 'default'
        }
    },
    fields: {
        props: {
            label: 'Goods Properties',
            type: Object,
            default: [],
            view: 'PropertyEditor',
            filters: {
                group: 'goods'
            },
            group: 'props',
            spec: {}
        },
        propValues: {
            label: 'Properties Values',
            type: 'relationship',
            ref: 'alaska-property.PropertyValue',
            default: [],
            index: true,
            multi: true,
            hidden: true,
            protected: true
        },
    },
    preSave() {
        if (this.isModified('props')) {
            let propValues = [];
            _.each(this.props, (prop) => {
                if (prop.filter) {
                    _.each(prop.values, (value) => {
                        propValues.push(String(value));
                    });
                }
            });
            this.propValues = propValues;
        }
    }
};
