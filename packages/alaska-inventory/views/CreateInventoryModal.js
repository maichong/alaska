"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const random = require("string-random");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const switch_1 = require("@samoyed/switch");
const toast_1 = require("@samoyed/toast");
const actionRedux = require("alaska-admin-view/redux/action");
const listsRedux = require("alaska-admin-view/redux/lists");
const Modal = require('react-bootstrap/Modal');
class CreateInventoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = () => {
            const { goods, sku, actionRequest, modelId } = this.props;
            let { type, desc } = this.state;
            let quantity = parseInt(this.state.quantity);
            let request = random();
            actionRequest({
                request,
                action: 'inventory',
                model: modelId,
                body: {
                    goods,
                    sku,
                    type,
                    desc,
                    quantity
                }
            });
            this.setState({ request });
        };
        this.handleQuantity = (e) => {
            this.setState({
                quantity: e.target.value
            });
        };
        this.handleDesc = (e) => {
            this.setState({
                desc: e.target.value
            });
        };
        this.handleType = (type) => {
            this.setState({ type });
        };
        this.state = {
            type: 'input',
            quantity: '',
            desc: '',
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { action } = nextProps;
        if (action === prevState._action)
            return null;
        if (action.request === prevState.request && !action.fetching) {
            if (action.error) {
                toast_1.default(tr('Failed'), action.error.message, { type: 'error' });
            }
            else {
                toast_1.default(tr('Success'), '', { type: 'success' });
            }
        }
        return { _action: action };
    }
    componentDidUpdate() {
        const { action, onClose, clearList } = this.props;
        const { request } = this.state;
        if (request && action && action.request === request && !action.fetching && !action.error) {
            clearList({ model: 'alaska-goods.Goods' });
            clearList({ model: 'alaska-sku.Sku' });
            clearList({ model: 'alaska-inventory.Inventory' });
            onClose();
        }
    }
    render() {
        const { onClose } = this.props;
        const { desc, quantity, type } = this.state;
        let disabled = !parseInt(quantity);
        return (React.createElement(Modal, { show: true, centered: true, onHide: onClose },
            React.createElement(Modal.Header, null, tr('Create inventory')),
            React.createElement(Modal.Body, null,
                React.createElement("div", { className: "form form-horizontal" },
                    React.createElement("div", { className: "form-group row" },
                        React.createElement("label", { className: "col-sm-2 col-form-label" }, tr('Type')),
                        React.createElement("div", { className: "col-sm-10" },
                            React.createElement(switch_1.default, { value: type, onChange: this.handleType, options: [
                                    { label: tr('Input'), value: 'input' },
                                    { label: tr('Output'), value: 'output' },
                                ] }))),
                    React.createElement("div", { className: "form-group row" },
                        React.createElement("label", { className: "col-sm-2 col-form-label" }, tr('Quantity')),
                        React.createElement("div", { className: "col-sm-10" },
                            React.createElement("input", { type: "text", className: "form-control", onChange: this.handleQuantity, value: quantity }))),
                    React.createElement("div", { className: "form-group row" },
                        React.createElement("label", { className: "col-sm-2 col-form-label" }, tr('Description')),
                        React.createElement("div", { className: "col-sm-10" },
                            React.createElement("input", { type: "text", className: "form-control", onChange: this.handleDesc, value: desc, placeholder: tr('Optional') }))))),
            React.createElement("div", { className: "modal-footer" },
                React.createElement("button", { className: "btn btn-light", onClick: onClose }, tr('Cancel')),
                React.createElement("button", { className: "btn btn-primary", onClick: this.handleSave, disabled: disabled }, tr('OK')))));
    }
}
exports.default = react_redux_1.connect((state) => ({ action: state.action }), (dispatch) => redux_1.bindActionCreators({
    actionRequest: actionRedux.actionRequest,
    clearList: listsRedux.clearList,
}, dispatch))(CreateInventoryModal);
