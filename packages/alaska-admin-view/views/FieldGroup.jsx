// @flow

import React from 'react';
import Node from './Node';

export default class FieldGroup extends React.Component {

  props: {
    children?: React$Element<any>,
    form?: boolean,
    panel?: boolean,
    className?: string,
    title?: string,
    style?: string,
    wrapper?: string,
  };

  render() {
    const { title, style, panel, form, className, wrapper, children } = this.props;
    let el = children;
    if (form !== false) {
      el = <div className="field-group-form form-horizontal">
        {el}
      </div>;
    }
    if (panel !== false) {
      let heading = title ? <div className="panel-heading">{title}</div> : null;
      let cls = 'field-group-panel panel panel-' + (style || 'default');
      if (className) {
        cls += ' ' + className;
      }
      el = <div className={cls}>
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
