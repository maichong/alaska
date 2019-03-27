"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const redux_1 = require("redux");
const react_redux_1 = require("react-redux");
const actionRedux = require("alaska-admin-view/redux/action");
const detailsRedux = require("alaska-admin-view/redux/details");
class PropertyValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = () => {
            let value = this.state.value.trim();
            if (!value)
                return;
            this.setState({ value: '' });
            this.props.actionRequest({
                action: 'create',
                model: 'alaska-property.PropertyValue',
                request: value,
                body: {
                    prop: this.props.record._id,
                    title: value
                }
            });
        };
        this.handleChange = (event) => {
            this.setState({ value: event.target.value });
        };
        this.handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                this.handleSave();
                event.preventDefault();
            }
        };
        this.state = {
            value: ''
        };
    }
    componentDidUpdate(prevProps) {
        let { action, model, record, loadDetails } = this.props;
        let { action: preAction } = prevProps;
        if (action && action.request === preAction.request && preAction.fetching && !action.fetching && !action.error) {
            if (model && model.id && record && record._id) {
                loadDetails({ model: model.id, id: record._id });
            }
        }
    }
    render() {
        let { value } = this.state;
        return (React.createElement("div", { className: "property-value-editor row" },
            React.createElement("div", { className: "col-sm-5 offset-sm-2 mb-2" },
                React.createElement("input", { className: "form-control", placeholder: tr('Please input property value', 'alaska-goods'), value: value, onKeyPress: this.handleKeyPress, onChange: this.handleChange })),
            React.createElement("div", { className: "col-sm-3" },
                React.createElement("button", { className: "btn btn-primary btn-block", onClick: this.handleSave }, tr('Save')))));
    }
}
exports.default = react_redux_1.connect(({ action }) => ({ action }), (dispatch) => redux_1.bindActionCreators({
    actionRequest: actionRedux.actionRequest,
    loadDetails: detailsRedux.loadDetails
}, dispatch))(PropertyValueEditor);
