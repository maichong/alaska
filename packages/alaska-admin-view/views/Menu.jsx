// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import Node from './Node';

function findSubs(subs, id) {
  for (let i = 0; i < subs.length; i += 1) {
    let sub = subs[i];
    if (sub.id === id) return true;
    if (sub.subs && sub.subs.length) {
      let has = findSubs(sub.subs, id);
      if (has) return true;
    }
  }
  return false;
}

type Props = {
  items: Object[],
  level: number,
  layout: string,
  value: string,
  onChange: Function
};

type State = {
  activated: string,
  opened: string
};

export default class Menu extends React.Component<Props, State> {
  static contextTypes = {
    views: PropTypes.object,
    t: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      activated: '',
      opened: ''
    };
  }

  shouldComponentUpdate(props: Props, state: State) {
    return state.activated !== this.state.activated ||
      state.opened !== this.state.opened || !shallowEqualWithout(props, this.props);
  }

  createMenuItem(item: Object, level: number) {
    const me = this;
    const { t } = this.context;
    const { layout, onChange, value } = this.props;
    let subMenu;
    let itemId = item.id;
    let activated = this.state.activated === itemId || value === itemId;
    let hasSubs = item.subs && item.subs.length;
    let opened = this.state.opened === itemId;
    if (opened && hasSubs) {
      let onChangeFinal = function (v) {
        onChange(v);
        let newState = { activated: '' };
        if (level === 0 && layout === 'icon') {
          // $Flow
          newState.opened = '';
        }
        me.setState(newState);
      };

      subMenu = <Menu
        items={item.subs}
        level={level + 1}
        layout={layout}
        onChange={onChangeFinal}
        value={value}
      />;
    }

    function onClick() {
      if (item.link) {
        me.props.onChange(item);
      }
      if (hasSubs) {
        if (!opened) {
          me.setState({ opened: itemId });
        } else {
          me.setState({ opened: '' });
        }
      } else if (!activated) {
        me.setState({ activated: itemId, opened: '' });
      }
    }

    let icon = item.icon || 'hashtag';
    let openedTxt = opened ? 'up' : 'down';
    let subsIcon = !hasSubs ? null : openedTxt;
    if (subsIcon) {
      if (layout === 'icon') {
        subsIcon = 'right';
      }
      subsIcon = <i className={'has-subs-icon fa fa-angle-' + subsIcon} />;
    }
    let badge = item.badge ? <span className={'label label-' + item.badgeStyle}>{item.badge}</span> : null;
    let className = activated ? 'activated' : '';
    if (opened || (value && hasSubs && findSubs(item.subs, value))) {
      className = 'opened';
    }
    return (
      <li key={item.id} className={className}>
        <a href="javascript:void(0)" onClick={onClick}>
          <i className={'fa fa-' + icon} />
          <span>{t(item.label, item.service)}</span>
          {badge}
          {subsIcon}
        </a>
        {subMenu}
      </li>
    );
  }

  render() {
    let props = this.props;
    let level = this.props.level || 0;
    let items = (props.items || []).map((item) => this.createMenuItem(item, level));
    return (<Node wrapper="menu" tag="ul" className={'sidebar-menu menu-' + level}>
      {items}
    </Node>);
  }
}
