// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

type Props = {
  value: Object,
  model: Alaska$view$Model,
  fields: Object,
  onChange: Function,
  onFieldsChange: Function,
  disabled: boolean
};

type State = {
  value: {}
};

export default class FilterEditor extends React.Component<Props, State> {
  static contextTypes = { views: PropTypes.object };

  constructor(props: Props) {
    super(props);
    this.state = { value: props.value };
  }

  componentWillReceiveProps(props: Props) {
    if (props.value !== this.state.value) {
      this.setState({ value: props.value });
    }
  }

  handleChange(path: string, v: string) {
    this.props.onChange(_.assign({}, this.state.value, { [path]: v }));
  }

  handleClose(path: string) {
    this.props.onChange(_.omit(this.state.value, path));
    this.props.onFieldsChange(_.omit(this.props.fields, path));
  }

  render() {
    const { fields, model } = this.props;
    const { value } = this.state;
    const { views } = this.context;
    return (
      <div className="filter-editor">{
        _.map(fields, (__, path) => {
          let field = model.fields[path];
          let FilterView = views[field.filter];
          return (
            <FilterView
              key={path}
              field={field}
              value={value[path]}
              onChange={(v) => this.handleChange(path, v)}
              onClose={() => this.handleClose(path)}
            />
          );
        })
      }
      </div>
    );
  }
}
