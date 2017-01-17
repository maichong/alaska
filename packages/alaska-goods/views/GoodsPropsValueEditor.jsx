// @flow

import React from 'react';
import { actions } from 'alaska-admin-view';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const { func } = React.PropTypes;

class GoodsPropsValueEditor extends React.Component {

  static contextTypes = {
    t: func
  };

  state: {
    value:string
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      value: ''
    };
  }

  shouldComponentUpdate(props, state) {
    return state.value !== this.state.value;
  }

  handleSave = () => {
    let value = this.state.value.trim();
    if (!value) return;
    this.setState({ value: '' });
    this.props.actions.save({
      service: 'alaska-goods',
      model: 'GoodsPropValue',
      key: 'alaska-goods.goods-prop-value',
      data: {
        prop: this.props.data._id,
        title: this.state.value
      }
    });
  };

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };
  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleSave();
      event.preventDefault();
    }
  };

  render() {
    const t = this.context.t;
    let state = this.state;
    return (
      <div className="row">
        <div className="col-md-5 col-md-offset-2">
          <input
            className="form-control" placeholder={t('Please input property value', 'alaska-goods')}
            value={state.value}
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
  actions: bindActionCreators(actions, dispatch)
}))(GoodsPropsValueEditor);
