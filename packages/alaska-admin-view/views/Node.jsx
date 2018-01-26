// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import type { Props } from 'alaska-admin-view/views/Node';

export default class Node extends React.Component<Props> {
  static contextTypes = { views: PropTypes.object };

  render() {
    let {
      tag, id, children, wrapper, props, state, ...others
    } = this.props;
    wrapper = wrapper || id;

    if (tag !== false) {
      tag = tag || 'div';
      children = React.createElement(
        tag,
        {
          id,
          ...others
        },
        children
      );
    }

    if (wrapper) {
      const wrappers = this.context.views.wrappers;
      if (wrappers[wrapper] && wrappers[wrapper].length) {
        children = _.reduce(
          wrappers[wrapper],
          (el, Wrapper) => React.createElement(Wrapper, _.assign({}, props || {}, { state }), el), children
        );
      }
    }
    return children;
  }
}
