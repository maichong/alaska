"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const redux_1 = require("redux");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const detailsRedux = require("alaska-admin-view/redux/details");
function nameToKey(name) {
    if (!name)
        return '';
    return name.replace(/([a-z])([A-Z])/g, (a, b, c) => (`${b}-${c.toLowerCase()}`)).toLowerCase();
}
class RelationshipFieldCell extends React.Component {
    shouldComponentUpdate(newProps) {
        let { details, field } = this.props;
        let key = nameToKey(field.model);
        if (!key)
            return false;
        let { value } = newProps;
        if (!value) {
            return false;
        }
        if (value !== this.props.value) {
            return true;
        }
        if (!newProps.details[key]) {
            return true;
        }
        if (Array.isArray(value)) {
            for (let id of value) {
                if (!details[key]) {
                    return !!(newProps.details[key]);
                }
                if (newProps.details[key][id] !== details[key][id]) {
                    return true;
                }
            }
        }
        if (typeof value === 'string' || typeof value === 'number') {
            if (!details[key]) {
                return !!(newProps.details[key] && newProps.details[key][value]);
            }
            if (newProps.details[key][value] !== details[key][value]) {
                return true;
            }
        }
        return false;
    }
    getLink(value) {
        let { field, details, settings } = this.props;
        const modelId = field.model;
        if (!modelId)
            return null;
        let [serviceId, modelName] = modelId.split('.');
        let Model = null;
        let serviceModels = settings.services[serviceId];
        if (serviceModels && serviceModels.models) {
            Model = serviceModels.models[modelName] || null;
        }
        if (!Model)
            return null;
        let { id } = Model;
        let title = value;
        if (value && details && details[id] && details[id][value]) {
            let modelTitleField = field.modelTitleField;
            title = details[id][value][modelTitleField] || value;
        }
        else if (!details[id] || !details[id][value]) {
            setTimeout(() => {
                this.props.loadDetails({
                    model: modelId,
                    id: value
                });
            });
            return null;
        }
        return (React.createElement(react_router_dom_1.Link, { key: value, to: `/edit/${serviceId}/${modelName}/${encodeURIComponent(value)}` }, title));
    }
    render() {
        let { value } = this.props;
        if (!value) {
            return React.createElement("div", { className: "relationship-field-cell" });
        }
        let display;
        if (Array.isArray(value)) {
            let arr = [];
            value.forEach((v) => {
                if (arr.length) {
                    arr.push(' , ');
                }
                arr.push(this.getLink(v));
            });
            display = arr;
        }
        else {
            display = this.getLink(value);
        }
        return (React.createElement("div", { className: "relationship-field-cell" }, display));
    }
}
exports.default = react_redux_1.connect(({ details, settings }) => ({ details, settings }), (dispatch) => ({
    loadDetails: redux_1.bindActionCreators(detailsRedux.loadDetails, dispatch)
}))(RelationshipFieldCell);
