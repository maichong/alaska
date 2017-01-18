/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-08-14
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import _map from 'lodash/map';
import _assign from 'lodash/assign';
import _omit from 'lodash/omit';

const { object, func, bool } = React.PropTypes;

export default class FilterEditor extends React.Component {

  static propTypes = {
    value: object,
    model: object,
    fields: object,
    onChange: func,
    onFieldsChange: func,
    disabled: bool
  };

  static contextTypes = {
    views: object
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.state.value) {
      this.setState({ value: props.value });
    }
  }

  handleChange(path, v) {
    this.props.onChange(_assign({}, this.state.value, { [path]: v }));
  }

  handleClose(path) {
    this.props.onChange(_omit(this.state.value, path));
    this.props.onFieldsChange(_omit(this.props.fields, path));
  }

  render() {
    const { fields, model } = this.props;
    const { value } = this.state;
    const { views } = this.context;
    return (
      <div className="filter-editor">{
        _map(fields, (_, path) => {
          let field = model.fields[path];
          let FilterView = views[field.filter];
          return <FilterView
            key={path}
            field={field}
            value={value[path]}
            onChange={(v) => this.handleChange(path,v)}
            onClose={() => this.handleClose(path)}
          />;
        })
      }</div>
    );
  }
}
