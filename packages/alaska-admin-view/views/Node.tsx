import * as React from 'react';
import * as _ from 'lodash';
import { NodeProps, views } from '..';

export default class Node extends React.Component<NodeProps> {
  render() {
    let { tag, children, wrapper, props, ...others } = this.props;
    if (tag !== false) {
      tag = tag || 'div';
      children = React.createElement(tag, others, children);
    }

    if (wrapper) {
      const wrappers = views.wrappers;
      if (wrappers[wrapper] && wrappers[wrapper].length) {
        children = _.reduce(
          wrappers[wrapper],
          (el, Wrapper) => React.createElement(
            Wrapper,
            _.assign({}, props),
            el
          ),
          children
        );
      }
    }

    return children;
  }
}
