/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-29
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import shallowEqual from '../utils/shallow-equal';
import Node from './Node';

const { object, func, number, array, string, node } = React.PropTypes;

function findSubs(subs, id) {
  for (let i in subs) {
    let sub = subs[i];
    if (sub.id == id) return true;
    if (sub.subs && sub.subs.length) {
      let has = findSubs(sub.subs, id);
      if (has) return true;
    }
  }
  return false;
}

export default class Menu extends React.Component {

  static propTypes = {
    children: node,
    items: array,
    level: number,
    layout: string,
    value: string,
    onChange: func
  };

  static contextTypes = {
    views: object,
    t: func
  };

  constructor(props) {
    super(props);
    this.state = {
      activated: '',
      opened: ''
    };
  }

  shouldComponentUpdate(props, state) {
    return state.activated != this.state.activated || state.opened != this.state.opened || !shallowEqual(props, this.props);
  }

  createMenuItem(item, level) {
    const me = this;
    const t = this.context.t;
    const { layout, onChange, value } = this.props;
    let subMenu;
    let itemId = item.id;
    let activated = this.state.activated == itemId || value == itemId;
    let hasSubs = item.subs && item.subs.length;
    let opened = this.state.opened == itemId;
    if (opened && hasSubs) {

      function onChangeFinal(v) {
        onChange(v);
        let newState = { activated: '' };
        if (level == 0 && layout == 'icon') {
          newState.opened = '';
        }
        me.setState(newState);
      }

      subMenu = <Menu
        items={item.subs}
        level={level + 1}
        layout={layout}
        onChange={onChangeFinal}
        value={value}/>
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
    let subsIcon = !hasSubs ? null : opened ? 'up' : 'down';
    if (subsIcon) {
      if (layout == 'icon') {
        subsIcon = 'right';
      }
      subsIcon = <i className={'has-subs-icon fa fa-angle-'+subsIcon}/>;
    }
    let badge = item.badge ? <span className={'label label-'+item.badgeStyle}>{item.badge}</span> : null;
    let className = activated ? 'activated' : '';
    if (opened || (value && hasSubs && findSubs(item.subs, value))) {
      className = 'opened';
    }
    return (
      <li key={item.id} className={className}>
        <a href="javascript:void(0)" onClick={onClick}>
          <i className={'fa fa-'+icon}/>
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
    let items = (props.items || []).map(item => this.createMenuItem(item, level));
    return <Node wrapper="menu" tag="ul" className={'sidebar-menu menu-'+level}>
      { items }
    </Node>;
  }
}
