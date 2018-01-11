// @flow

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

type Props = {
  children: React$Node,
  tooltip: string,
  placement?: string
};

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
