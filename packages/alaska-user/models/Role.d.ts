
import { Model } from 'alaska-model';

declare class Role extends Model {
  _id: string;
  id: string;
  title: string;
  abilities: Object[];
  sort: number;
  createdAt: Date;
}

export default Role;
