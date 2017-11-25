// @flow

import React from 'react';
import Node from './Node';

type Props = {
  children: React$Node,
  form?: boolean,
  panel?: boolean,
  className?: string,
  title?: string,
  wrapper?: string,
};

export default class FieldGroup extends React.Component<Props> {
  render() {
    const {
      title, panel, form, className, wrapper, children
    } = this.props;
    let el = children;
    if (form !== false) {
      el = <div className="field-group-form form-horizontal">
        {el}
      </div>;
    }
    if (panel !== false) {
      let heading = title ? <div className="panel-heading">{title}</div> : null;
      el = <div className={className}>
        {heading}
        <div className="panel-body">{el}</div>
      </div>;
    }

    if (wrapper) {
      return <Node wrapper={wrapper} props={this.props}>{el}</Node>;
    }
    return el;
  }
}
