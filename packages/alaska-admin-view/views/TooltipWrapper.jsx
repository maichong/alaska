/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-08-29
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

type Props = {
  children: React$Node,
  tooltip: string,
  placement?: string
};

export default class TooltipWrapper extends React.Component<Props> {
  static defaultProps = {
    placement: 'top'
  };

  constructor(props: Props) {
    super(props);
    this.id = Math.random();
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
