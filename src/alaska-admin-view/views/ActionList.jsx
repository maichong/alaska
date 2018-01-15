// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import checkDepends from 'check-depends';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import Action from './Action';

type Props = {
  editor?: boolean,
  disabled?: boolean,
  model: Alaska$view$Model,
  record?: ImmutableObject<Alaska$view$Record>,
  records?: ImmutableArray<Alaska$view$Record>,
  selected?: ImmutableArray<Alaska$view$Record>,
  refresh?: Function,
  items: Array<{
    key: string,
    onClick?: Function,
    link?: string,
    action: Alaska$Model$action
  }>,
};

export default class ActionList extends React.Component<Props> {
  static contextTypes = {
    settings: PropTypes.object
  };

  context: {
    settings: Alaska$view$Settings
  };

  render() {
    const { settings } = this.context;
    const {
      items, editor, model, record, records, selected, refresh, disabled
    } = this.props;

    // 排序
    const map = _.reduce(items, (res, item) => {
      res[item.key] = { item, afters: [] };
      return res;
    }, {});

    let list = [];

    _.forEach(map, (el) => {
      let { after } = el.item.action;
      if (after && map[after]) {
        map[after].afters.push(el);
      } else {
        list.push(el);
      }
    });

    let keys = [];

    function flat(el) {
      keys.push(el.item.key);
      el.afters.forEach(flat);
    }

    _.forEach(list, flat);

    let elements = [];

    keys.forEach((key) => {
      let { item } = map[key];
      let { action, onClick, link } = item;
      let { ability } = action;

      let abilityDisabled = false;
      if (typeof ability === 'function') {
        ability = ability(record);
      }
      if (ability && ability[0] === '*') {
        ability = ability.substr(1);
        abilityDisabled = true;
      }
      let hasAbility = !ability || settings.abilities[ability] || false;

      // 自定义权限未满足
      if (!hasAbility && !abilityDisabled) return;

      if (!ability) {
        // 默认权限
        // $Flow action.key 一定存在
        let abilityKey = action.key;
        if (abilityKey === 'add') {
          abilityKey = 'create'; // add 使用 create 权限
        }
        if (!model.abilities[abilityKey]) return; // 权限认证
      }

      let actionDisabled = disabled || abilityDisabled;

      if (editor) {
        // 编辑页面
        if (action.list && !action.editor) return; // 编辑页面不现实列表专有Action
        if (checkDepends(action.hidden, record)) return;
        if (action.depends && !checkDepends(action.depends, record)) return;
        if (!settings.superMode && checkDepends(action.super, record)) return;
      } else {
        // 列表页面
        if (!action.list) return;// 列表页面不现实编辑页面专有Action
        if (action.hidden) return;
        if (action.depends) return;
        if (!settings.superMode && action.super) return;
      }

      elements.push(<Action
        key={key}
        action={action}
        disabled={actionDisabled}
        record={record}
        records={records}
        selected={selected}
        model={model}
        onClick={onClick}
        link={link}
        refresh={refresh}
      />);
    });

    return elements;
  }
}
