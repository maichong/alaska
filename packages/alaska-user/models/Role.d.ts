
import { Model } from 'alaska-model';

declare class Role extends Model { }
interface Role extends RoleFields { }

export interface RoleFields {
  id: string;
  title: string;
  abilities: string[];
  sort: number;
  createdAt: Date;
}

export default Role;
