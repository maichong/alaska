// @flow

import React from 'react';
import _ from 'lodash';

const { object } = React.PropTypes;

export default class Node extends React.Component {

  static contextTypes = {
    views: object
  };

  props: {
    children?: React$Element<any>,
    tag?: string,
    id?: string,
    wrapper?: string,
    props?: Object,
    state?: Object,
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
        children = _.reduce(wrappers[wrapper],
          (el, Wrapper) => React.createElement(Wrapper, _.assign({}, props || {}, { state }), el), children);
      }
    }
    return children;
  }
}
