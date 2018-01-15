// $Flow

export default function parseAbility(ability: string, data?: Object) {
  if (typeof ability === 'function' && data) {
    ability = ability(data);
  }
  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }
  return ability;
}
