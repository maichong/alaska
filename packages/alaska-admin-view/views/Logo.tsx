import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Node from './Node';
import { LogoProps, State } from '..';

interface Props extends LogoProps {
  logo: string;
  icon: string;
}

class Logo extends React.Component<Props> {
  render() {
    const { logo: propLogo, icon: propIcon } = this.props;
    let logo = propLogo || '/admin/img/logo.png';
    let icon = propIcon || '/admin/img/icon.png';
    return (
      <Node
        className="logo"
        wrapper="Logo"
        props={this.props}
      >
        <Link to="/">
          <img alt="" className="logo-img" src={logo} />
          <img alt="" className="icon-img" src={icon} />
        </Link>
      </Node>
    );
  }
}

export default connect(
  ({ settings }: State) => ({ logo: settings.logo, icon: settings.icon })
)(Logo);
