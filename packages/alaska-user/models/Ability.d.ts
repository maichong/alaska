import { Model } from 'alaska-model';

declare class Ability extends Model {
  _id: string;
  id: string;
  title: string;
  service: string;
  createdAt: Date;
}

export default Ability;
