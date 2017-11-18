// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as saveRedux from 'alaska-admin-view/redux/save';

type Props = {
  record: Alaska$view$Record,
  save: Function
};

type State = {
  value: string
};

class GoodsPropsValueEditor extends React.Component<Props, State> {
  static contextTypes = {
    t: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  shouldComponentUpdate(props: Props, state: State) {
    return state.value !== this.state.value;
  }

  handleSave = () => {
    let value = this.state.value.trim();
    if (!value) return;
    this.setState({ value: '' });
    this.props.save({
      service: 'alaska-goods',
      model: 'GoodsPropValue',
      key: 'alaska-goods.goods-prop-value'
    }, {
      prop: this.props.record._id,
      title: this.state.value
    });
  };

  handleChange = (event: SyntheticInputEvent<*>) => {
    this.setState({ value: event.target.value });
  };

  handleKeyPress = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      this.handleSave();
      event.preventDefault();
    }
  };

  render() {
    const { t } = this.context;
    let { value } = this.state;
    return (
      <div className="row">
        <div className="col-md-5 col-md-offset-2">
          <input
            className="form-control"
            placeholder={t('Please input property value', 'alaska-goods')}
            value={value}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChange}
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary btn-block" onClick={this.handleSave}>{t('Save')}</button>
        </div>
      </div>
    );
  }
}

export default connect(null, (dispatch) => ({
  save: bindActionCreators(saveRedux.save, dispatch)
}))(GoodsPropsValueEditor);
