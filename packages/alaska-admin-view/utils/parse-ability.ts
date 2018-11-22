
import { AbilityGenerator } from 'alaska';

export default function parseAbility(ability: string | AbilityGenerator, data: Object | null, user?: Object): string {
  if (typeof ability === 'function' && data) {
    ability = ability(data, user);
  }
  if (ability && typeof ability === 'string' && ability[0] === '*') {
    ability = ability.substr(1);
  }
  // @ts-ignore 此处ability一定为string
  return ability;
}
