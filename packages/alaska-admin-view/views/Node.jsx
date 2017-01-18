/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-07-11
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import _reduce from 'lodash/reduce';
import _assign from 'lodash/assign';

const { node, string, object } = React.PropTypes;

export default class Node extends React.Component {

  static propTypes = {
    children: node,
    tag: string,
    id: string,
    wrapper: string,
    props: object,
    state: object,
  };

  static contextTypes = {
    views: object
  };

  render() {
    let { tag, id, children, wrapper, props, state, ...others } = this.props;
    wrapper = wrapper || id;

    tag = tag || 'div';
    children = React.createElement(
      tag,
      {
        id,
        ...others
      },
      children
    );
    if (wrapper) {
      const wrappers = this.context.views.wrappers;
      if (wrappers[wrapper] && wrappers[wrapper].length) {
        children = _reduce(wrappers[wrapper], (el, Wrapper) => React.createElement(Wrapper, _assign({}, props, { state }), el), children);
      }
    }
    return children;
  }
}
