// @flow

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import type { Props } from 'alaska-admin-view/views/TooltipWrapper';

export default class TooltipWrapper extends React.Component<Props> {
  static defaultProps = { placement: 'top' };
  id: string;

  constructor(props: Props) {
    super(props);
    this.id = Math.random().toString();
  }

  render() {
    const {
      children, tooltip, placement, ...others
    } = this.props;
    return (
      <OverlayTrigger
        placement={placement}
        overlay={<Tooltip id={this.id}>{tooltip}</Tooltip>}
        {...others}
      >{children}
      </OverlayTrigger>
    );
  }
}
