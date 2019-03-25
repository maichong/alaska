import * as React from 'react';
import * as _ from 'lodash';
import { NodeProps, views } from '..';

export default (function Node(p: NodeProps) {
  let { tag, children, wrapper, props, domRef, ...others } = p;
  if (tag !== false) {
    tag = (tag || 'div');
    children = React.createElement(tag, { ref: domRef, ...others }, children);
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
}) as React.FunctionComponent<NodeProps>;
