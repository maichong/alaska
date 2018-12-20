import * as checkDepends from 'check-depends';
import * as _ from 'lodash';
import { AbilityCheckGate } from 'alaska-model';
import store from '../redux';
import views from './views';
import { ObjectMap } from 'alaska';
import { Settings } from '..';

const warning: ObjectMap<boolean> = {};

/**
 * 检查当前用户是否拥有指定 ability
 * @param ability
 * @param record
 */
function hasAbility(ability: string, record?: any): boolean {
  let settings: Settings = store.getState().settings;
  let { abilities } = settings;
  let [prefix, checker] = ability.split(':');
  if (!record) {
    // 不检查数据记录，只检查数据类型
    if (abilities[ability] === true) return true;
    if (checker) return false;
    for (let str of _.keys(abilities)) {
      str = str.split(':')[0];
      if (str === ability) return true;
    }
    return false;
  }

  // 需要检查数据记录
  if (checker && !views.urrc.hasOwnProperty(checker)) {
    // checker 函数不存在
    if (!warning[checker]) {
      console.error(`Missing URRC: ${checker}`);
      warning[checker] = true;
    }
    return false;
  }

  for (let str of _.keys(abilities)) {
    let [p, c] = str.split(':');
    if (prefix !== p) continue;
    if (checker && c !== checker) continue;
    if (!c) return true; // 拥有全类管理权限
    if (!views.urrc.hasOwnProperty(c)) {
      if (!warning[c]) {
        console.error(`Missing URRC: ${c}`);
        warning[c] = true;
      }
      continue;
    }
    if (views.urrc[c].check(settings.user, record)) return true;
  }
  return false;
}

/**
 * 检查权限
 * @param {any} conditions
 * @param {object} [record]
 */
export default function checkAbility(
  conditions: checkDepends.DependsQueryExpression | AbilityCheckGate[],
  record?: any
): boolean {
  if (!conditions) return false;
  if (!Array.isArray(conditions)) return checkDepends(conditions, record);
  // 寻找开着的门
  return !_.find(conditions, (gate: AbilityCheckGate) => {
    if (gate.check) {
      if (!checkDepends(gate.check, record)) return false; // 此门不开
    }
    if (gate.ability) {
      if (!hasAbility(gate.ability, record)) return false; // 此门不开
    }
    return true; // 此门开着，放水
  });
}
