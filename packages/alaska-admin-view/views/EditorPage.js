"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const React = require("react");
const qs = require("qs");
const react_router_dom_1 = require("react-router-dom");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const Node_1 = require("./Node");
const EditorToolbar_1 = require("./EditorToolbar");
const RelationshipPage_1 = require("./RelationshipPage");
const EditorActionBar_1 = require("./EditorActionBar");
const Editor_1 = require("./Editor");
const LoadingPage_1 = require("./LoadingPage");
const detailsRedux = require("../redux/details");
class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (record, errors) => {
            this.setState({ record, errors });
        };
        this.handleTab = (t) => {
            this.setState({ tab: t });
        };
        this.state = {
            _action: props.action,
            id: '_new',
            model: null,
            record: null,
            errors: null,
            isNew: true,
            tab: ''
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { params } = nextProps.match;
        const modelId = `${params.service}.${params.model}`;
        const model = nextProps.models[modelId] || prevState.model;
        if (!model)
            return null;
        const { action } = nextProps;
        const nextState = {
            _action: action,
            id: params.id,
            isNew: params.id === '_new'
        };
        if (model && (!prevState.model || prevState.model !== model)) {
            nextState.model = model;
        }
        if (nextState.isNew) {
            if (!prevState.record
                || prevState.record.id ||
                (prevState.model && prevState.model.id !== model.id)) {
                let init = { isNew: true };
                _.forEach(model.fields, (field, key) => {
                    if (typeof field.default !== 'undefined') {
                        init[key] = field.default;
                    }
                });
                const { location, user } = nextProps;
                let queryString = (location.search || '').substr(1);
                let query = qs.parse(queryString) || {};
                _.forEach(query, (v, k) => {
                    if (k[0] === '_')
                        return;
                    if (v === 'NOW' && model.fields[k] && model.fields[k].plainName === 'date') {
                        v = new Date();
                    }
                    else if (v === 'SELF' && model.fields[k] && model.fields[k].model === 'alaska-user.User') {
                        v = user.id;
                    }
                    init[k] = v;
                });
                nextState.record = immutable(init);
            }
        }
        else {
            let details = nextProps.details[modelId];
            let reduxRecord = details ? (details[params.id] || null) : null;
            nextState._record = reduxRecord;
            if (prevState._record && reduxRecord && reduxRecord !== prevState._record) {
                nextState.record = reduxRecord;
            }
            else if (!prevState.isNew && prevState.id !== nextState.id) {
                nextState.record = null;
            }
            else if (!reduxRecord || !prevState.record) {
                nextState.record = reduxRecord;
            }
            if (prevState._action !== action
                && action.action
                && !['create', 'update', 'remove'].includes(action.action)
                && !action.fetching
                && !action.error) {
                nextState.record = null;
            }
        }
        return nextState;
    }
    componentDidMount() {
        const { model, id, isNew } = this.state;
        if (!isNew) {
            this.props.loadDetails({ model: model.id, id });
        }
    }
    componentDidUpdate() {
        const { model, id, isNew, record } = this.state;
        if (!isNew && record === null) {
            this.props.loadDetails({ model: model.id, id });
        }
    }
    renderLayout(content, hasActionBar) {
        const { model, record, isNew, tab } = this.state;
        let className = [
            'page',
            'editor-page',
            `${model.serviceId}-${model.id}`,
            model.canCreate ? 'can-create' : 'no-create',
            model.canUpdate ? 'can-update' : 'no-update',
            model.canRemove ? 'can-remove' : 'no-remove',
        ].join(' ');
        let editorTitle = record ? (record[model.titleField] || String(record._id)) : '';
        if (isNew) {
            editorTitle = tr('Create', model.serviceId);
        }
        return (React.createElement(Node_1.default, { wrapper: "EditorPage", props: this.props, className: className },
            React.createElement("div", { className: "page-inner editor-page-inner" },
                React.createElement(EditorToolbar_1.default, { model: model, record: record, tab: tab, onChangeTab: this.handleTab },
                    React.createElement(react_router_dom_1.Link, { to: `/list/${model.serviceId}/${model.modelName}` }, tr(model.label, model.serviceId)),
                    "\u00A0",
                    '>',
                    "\u00A0",
                    editorTitle),
                content,
                hasActionBar && React.createElement(EditorActionBar_1.default, { model: model, record: record }))));
    }
    renderError() {
        const { model, record } = this.state;
        return (React.createElement("div", { className: "error-info" },
            React.createElement("div", { className: "error-title" }, tr('Error', model.serviceId)),
            React.createElement("div", { className: "error-desc" },
                tr(record._error, model.serviceId),
                "\u00A0",
                React.createElement(react_router_dom_1.Link, { to: `/edit/${model.serviceId}/${model.modelName}/_new` }, tr('Create', model.serviceId)))));
    }
    render() {
        const { model, record, errors, tab, isNew } = this.state;
        if (!model) {
            return React.createElement(LoadingPage_1.default, null);
        }
        if (!record) {
            return this.renderLayout(React.createElement(LoadingPage_1.default, null), false);
        }
        let el;
        let relationship;
        if (record && record._error) {
            el = this.renderError();
        }
        else {
            relationship = !isNew && tab && _.find(model.relationships, (r) => r.key === tab);
            if (relationship) {
                el = React.createElement(RelationshipPage_1.default, { model: model, relationship: relationship, record: record });
            }
            else {
                el = React.createElement(Editor_1.default, { model: model, record: record, errors: errors, onChange: this.handleChange });
            }
        }
        return this.renderLayout(el, !relationship);
    }
}
exports.default = react_redux_1.connect(({ details, settings, action }) => ({ details, models: settings.models, action, user: settings.user }), (dispatch) => redux_1.bindActionCreators({
    loadDetails: detailsRedux.loadDetails
}, dispatch))(EditorPage);
