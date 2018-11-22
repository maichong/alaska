import * as React from 'react';
import * as _ from 'lodash';
import * as PropTypes from 'prop-types';
import { NodeProps } from '..';

export default class Node extends React.Component<NodeProps> {
  static contextTypes = {
    views: PropTypes.object
  };
  context: any;

  render() {
    let { tag, children, wrapper, props, ...others } = this.props;
    if (tag !== false) {
      tag = tag || 'div';
      children = React.createElement(tag, others, children);
    }

    if (wrapper) {
      const wrappers = this.context.views.wrapper;
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
