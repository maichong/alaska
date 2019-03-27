"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkDepends = require("check-depends");
const _ = require("lodash");
const redux_1 = require("../redux");
const views_1 = require("./views");
const warning = {};
function hasAbility(ability, record) {
    if (ability === 'every')
        return true;
    if (ability === 'god')
        return false;
    let settings = redux_1.default.getState().settings;
    let { abilities } = settings;
    let [prefix, checker] = ability.split(':');
    if (!record || record.isNew) {
        if (abilities[ability] === true)
            return true;
        if (checker)
            return false;
        for (let str of _.keys(abilities)) {
            str = str.split(':')[0];
            if (str === ability)
                return true;
        }
        return false;
    }
    if (checker && !views_1.default.urrc.hasOwnProperty(checker)) {
        if (!warning[checker]) {
            console.error(`Missing URRC: ${checker}`);
            warning[checker] = true;
        }
        return false;
    }
    for (let str of _.keys(abilities)) {
        let [p, c] = str.split(':');
        if (prefix !== p)
            continue;
        if (checker && c !== checker)
            continue;
        if (!c)
            return true;
        if (!views_1.default.urrc.hasOwnProperty(c)) {
            if (!warning[c]) {
                console.error(`Missing URRC: ${c}`);
                warning[c] = true;
            }
            continue;
        }
        if (views_1.default.urrc[c].check(settings.user, record))
            return true;
    }
    return false;
}
exports.hasAbility = hasAbility;
function checkAbility(conditions, record) {
    if (!conditions)
        return false;
    if (!Array.isArray(conditions))
        return checkDepends(conditions, record || {});
    return !_.find(conditions, (gate) => {
        if (gate.check) {
            if (!checkDepends(gate.check, record || {}))
                return false;
        }
        if (gate.ability) {
            if (!hasAbility(gate.ability, record))
                return false;
        }
        return true;
    });
}
exports.default = checkAbility;
