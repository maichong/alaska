'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAbility;
// $Flow

function parseAbility(ability, data, user) {
  if (typeof ability === 'function' && data) {
    ability = ability(data, user);
  }
  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }
  return ability;
}