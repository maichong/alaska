import { Model } from 'alaska-model';

declare class AdminMenu extends Model {
  _id: string;
  id: string;
  label: string;
  icon: string;
  type: string;
  parent: string;
  nav?: string;
  service: string;
  link: string;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}

export default AdminMenu;
