/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-21
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import Node from './Node';

const { node, bool, string } = React.PropTypes;

export default class FieldGroup extends React.Component {

  static propTypes = {
    children: node,
    form: bool,
    panel: bool,
    className: string,
    style: string,
    wrapper: string,
  };

  render() {
    let props = this.props
    let el = props.children;
    if (props.form !== false) {
      el = <div className="field-group-form form-horizontal">
        {el}
      </div>;
    }
    if (props.panel !== false) {
      let heading = props.title ? <div className="panel-heading">{props.title}</div> : null;
      let cls = 'field-group-panel panel panel-' + (props.style || 'default');
      if (props.className) {
        cls += ' ' + props.className;
      }
      el = <div className={cls}>
        {heading}
        <div className="panel-body">{el}</div>
      </div>;
    }

    if (props.wrapper) {
      return <Node wrapper={props.wrapper} props={this.props}>{el}</Node>;
    }
    return el;
  }
}
