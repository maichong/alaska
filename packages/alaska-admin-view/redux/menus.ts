import * as _ from 'lodash';
import {
  createAction,
  handleActions
} from 'redux-actions';
import * as immutable from 'seamless-immutable';
import { Menus, Menu, Settings, MenuItem } from '..';

export const APPLY_MENUS_NAV = 'APPLY_MENUS_NAV';

/**
 * 当前选中的nav
 * @param {string} id
 */
export const applyMenusNav = createAction(APPLY_MENUS_NAV, (id: string) => ({ id }));

// 初始state
const INITIAL_STATE: Menus = immutable({ navId: 'default', menusMap: {}});

//生成最终menu数据
function recursion(menuItems: MenuItem[], parentList?: Menu[]) {
  let parents = parentList || _.filter(menuItems, (val) => !val.parent);
  parents = _.orderBy(parents, ['sort'], ['desc']);
  let list = _.map(parents, (val) => {
    let array = _.filter(menuItems, (v) => v.parent === val.id);
    if (val.type === 'link' || array.length <= 0) return val;
    let subs = recursion(menuItems, array);
    // @ts-ignore
    val = immutable.set(val, 'subs', subs);
    return val;
  });
  return list;
}

export default handleActions({
  APPLY_SETTINGS: (state, action) => {
    // @ts-ignore
    const settings: Settings = action.payload;
    let { menuItems, navItems, abilities } = settings;
    let navIds: Array<string> = [];
    _.map(navItems, (item) => {
      if (item.activated && abilities[item.ability]) {
        navIds.push(String(item.id));
      }
    });
    let newMenuItems: MenuItem[] = _.filter(
      menuItems,
      (item) => item.activated && abilities[item.ability]
      && (!item.nav || navIds.indexOf(String(item.nav)) >= 0)
    );
    let menus = recursion(newMenuItems);
    let menusMap = _.groupBy(menus, 'nav');
    if (navIds.length && state.navId && navIds.indexOf(state.navId) < 0) {
      return state.merge({ menusMap, navId: navIds[0] });
    }
    return state.merge({ menusMap });
  },
  APPLY_MENUS_NAV: (state, action) => {
    // @ts-ignore
    const payload: { id: string } = action.payload;
    return state.merge({ navId: payload.id });
  }
}, INITIAL_STATE);
