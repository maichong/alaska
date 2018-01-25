// $Flow

export default function parseAbility(ability: string, data: Object | null, user: Object) {
  if (typeof ability === 'function' && data) {
    ability = ability(data, user);
  }
  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }
  return ability;
}
