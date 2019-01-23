import * as React from 'react';
import * as tr from 'grackle';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Record, Model, ActionState, StoreState, ActionRequestPayload } from 'alaska-admin-view';
import * as actionRedux from 'alaska-admin-view/redux/action';
import * as detailsRedux from 'alaska-admin-view/redux/details';

type Props = {
  record: Record;
  model: Model;
  actionRequest: (req: ActionRequestPayload) => any;
  action: ActionState;
  loadDetails: Function;
};

type State = {
  value: string;
};

class PropertyValueEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  // shouldComponentUpdate(props: Props, state: State) {
  //   return state.value !== this.state.value;
  // }

  componentDidUpdate(prevProps: Props) {
    let { action, model, record, loadDetails } = this.props;
    let { action: preAction } = prevProps;
    //前后action.fetching对比，保证刷新一次详情
    if (action && action.request === preAction.request && preAction.fetching && !action.fetching && !action.error) {
      if (model && model.id && record && record._id) {
        loadDetails({ model: model.id, id: record._id });
      }
    }
  }

  handleSave = () => {
    let value = this.state.value.trim();
    if (!value) return;
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

  handleChange = (event: any) => {
    this.setState({ value: event.target.value });
  };

  handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      this.handleSave();
      event.preventDefault();
    }
  };

  render() {
    let { value } = this.state;
    return (
      <div className="property-value-editor row">
        <div className="col-sm-5 offset-sm-2 mb-2">
          <input
            className="form-control"
            placeholder={tr('Please input property value', 'alaska-goods')}
            value={value}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChange}
          />
        </div>
        <div className="col-sm-3">
          <button className="btn btn-primary btn-block" onClick={this.handleSave}>{tr('Save')}</button>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ action }: StoreState) => ({ action }),
  (dispatch) => bindActionCreators({
    actionRequest: actionRedux.actionRequest,
    loadDetails: detailsRedux.loadDetails
  }, dispatch))(PropertyValueEditor);
