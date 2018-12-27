import * as React from 'react';
import * as tr from 'grackle';
import * as random from 'string-random';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal from 'reactstrap/lib/Modal';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import ModalBody from 'reactstrap/lib/ModalBody';
import Switch from '@samoyed/switch';
import { StoreState, ActionRequestPayload, ClearListPayload, ActionState } from 'alaska-admin-view';
import * as actionRedux from 'alaska-admin-view/redux/action';
import * as listsRedux from 'alaska-admin-view/redux/lists';

interface Props {
  modelId: string;
  goods: string;
  sku?: string;
  action: ActionState;
  onClose: () => any;
  actionRequest: (req: ActionRequestPayload) => any;
  clearList: (req: ClearListPayload) => any;
}

interface State {
  request?: string;
  type: string;
  quantity: string;
  desc: string;
}

class CreateInventoryModal extends React.Component<Props, State> {
  id: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      type: 'input',
      quantity: '',
      desc: '',
    };
    this.id = random();
  }

  handleSave = () => {
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

  handleQuantity = (e: any) => {
    this.setState({
      quantity: e.target.value
    });
  };

  handleDesc = (e: any) => {
    this.setState({
      desc: e.target.value
    });
  };

  handleType = (type: string) => {
    this.setState({ type });
  };

  componentDidUpdate() {
    const { action, onClose, clearList } = this.props;
    const { request } = this.state;
    if (request && action && action.request === request && !action.fetching && !action.error) {
      // 成功
      // 刷新list
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
    return (
      <Modal isOpen key={this.id}>
        <ModalHeader toggle={onClose}>
          {tr('Create inventory')}
        </ModalHeader>
        <ModalBody>
          <div className="form form-horizontal">
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">{tr('Type')}</label>
              <div className="col-sm-10">
                <Switch
                  value={type}
                  onChange={this.handleType}
                  options={[
                    { label: tr('Input'), value: 'input' },
                    { label: tr('Output'), value: 'output' },
                  ]}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">{tr('Quantity')}</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" onChange={this.handleQuantity} value={quantity} />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">{tr('Description')}</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" onChange={this.handleDesc} value={desc} placeholder={tr('Optional')} />
              </div>
            </div>
          </div>
        </ModalBody>
        <div className="modal-footer">
          <button className="btn btn-light" onClick={onClose}>{tr('Cancel')}</button>
          <button className="btn btn-primary" onClick={this.handleSave} disabled={disabled}>{tr('OK')}</button>
        </div>
      </Modal>
    );
  }
}

export default connect(
  (state: StoreState) => ({ action: state.action }),
  (dispatch) => bindActionCreators({
    actionRequest: actionRedux.actionRequest,
    clearList: listsRedux.clearList,
  }, dispatch)
)(CreateInventoryModal);
