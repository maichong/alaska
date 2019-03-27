"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const redux_actions_1 = require("redux-actions");
const immutable = require("seamless-immutable");
exports.APPLY_MENUS_NAV = 'APPLY_MENUS_NAV';
exports.applyMenusNav = redux_actions_1.createAction(exports.APPLY_MENUS_NAV, (id) => ({ id }));
const INITIAL_STATE = immutable({ navId: 'default', menusMap: {} });
function recursion(menuItems, parentList) {
    let parents = parentList || _.filter(menuItems, (val) => !val.parent);
    parents = _.orderBy(parents, ['sort'], ['desc']);
    let list = _.map(parents, (val) => {
        let array = _.filter(menuItems, (v) => v.parent === val.id);
        if (val.type === 'link' || array.length <= 0)
            return val;
        let subs = recursion(menuItems, array);
        val = immutable.set(val, 'subs', subs);
        return val;
    });
    return list;
}
exports.default = redux_actions_1.handleActions({
    APPLY_SETTINGS: (state, action) => {
        const settings = action.payload;
        let { menuItems, navItems, abilities } = settings;
        let navIds = [];
        _.map(navItems, (item) => {
            if (item.activated && abilities[item.ability]) {
                navIds.push(String(item.id));
            }
        });
        let newMenuItems = _.filter(menuItems, (item) => item.activated && (!item.nav || navIds.indexOf(String(item.nav)) >= 0));
        let menus = recursion(newMenuItems);
        let menusMap = _.groupBy(menus, 'nav');
        if (navIds.length && state.navId && navIds.indexOf(state.navId) < 0) {
            return state.merge({ menusMap, navId: navIds[0] });
        }
        return state.merge({ menusMap });
    },
    APPLY_MENUS_NAV: (state, action) => {
        const payload = action.payload;
        return state.merge({ navId: payload.id });
    }
}, INITIAL_STATE);
