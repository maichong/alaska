import { Model } from 'alaska-model';

declare class AdminNav extends Model { }
interface AdminNav extends AdminNavFields { }

export interface AdminNavFields {
  label: string;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}

export default AdminNav;
