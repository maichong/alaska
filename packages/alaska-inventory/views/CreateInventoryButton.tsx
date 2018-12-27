import * as React from 'react';
import * as tr from 'grackle';
import { ActionViewProps } from 'alaska-admin-view';
import CreateInventoryModal from './CreateInventoryModal';

interface State {
  opened?: boolean;
}

export default class CreateInventoryButton extends React.Component<ActionViewProps, State> {
  constructor(props: ActionViewProps) {
    super(props);
    this.state = {};
  }

  handleClick = () => {
    const { disabled } = this.props;
    if (!disabled) {
      this.setState({ opened: true });
    }
  };

  handleClose = () => {
    this.setState({ opened: false });
  };

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
    } else {
      goods = record._id;
      if (model.modelName === 'Sku') {
        goods = record.goods;
        sku = record._id;
      }
    }
    return (
      <div className={'btn btn-primary' + (disabled ? ' disabled' : '')} onClick={this.handleClick}>
        <i className="fa fa-truck" />
        {' ' + tr('Input Inventory')}
        {this.state.opened && !disabled && <CreateInventoryModal
          modelId={model.id}
          goods={goods}
          sku={sku}
          onClose={this.handleClose}
        />}
      </div>
    );
  }
}
