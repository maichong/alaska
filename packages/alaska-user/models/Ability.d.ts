import { Model } from 'alaska-model';

declare class Ability extends Model { }
interface Ability extends AbilityFields { }

export interface AbilityFields {
  id: string;
  title: string;
  service: string;
  createdAt: Date;
}

export default Ability;
