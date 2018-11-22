import { Model } from 'alaska-model';

declare class AdminNav extends Model {
  _id: string;
  id: string;
  label: string;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}

export default AdminNav;
