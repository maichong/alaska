"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const _ = require("lodash");
const CreateInventoryModal_1 = require("./CreateInventoryModal");
class CreateInventoryButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = () => {
            const { disabled } = this.props;
            if (!disabled) {
                this.setState({ opened: true });
            }
        };
        this.handleClose = () => {
            this.setState({ opened: false });
        };
        this.state = {};
    }
    render() {
        let { disabled, record, selected, model } = this.props;
        if (selected) {
            if (selected.length > 1) {
                disabled = true;
            }
            record = selected[0];
        }
        let goods = '';
        let sku = '';
        if (!record) {
            disabled = true;
        }
        else {
            if (!record._id)
                return null;
            goods = record._id;
            if (model.modelName === 'Sku') {
                goods = record.goods;
                sku = record._id;
            }
            else if (model.modelName === 'Goods') {
                if (_.size(record.skus))
                    return null;
            }
        }
        return (React.createElement(React.Fragment, null,
            React.createElement("button", { className: `btn btn-primary with-icon with-title${disabled ? ' disabled' : ''}`, onClick: this.handleClick },
                React.createElement("i", { className: "action-icon fa fa-truck" }),
                ' ',
                React.createElement("span", { className: "action-title" }, tr('Input Inventory'))),
            this.state.opened && !disabled && React.createElement(CreateInventoryModal_1.default, { modelId: model.id, goods: goods, sku: sku, onClose: this.handleClose })));
    }
}
exports.default = CreateInventoryButton;
