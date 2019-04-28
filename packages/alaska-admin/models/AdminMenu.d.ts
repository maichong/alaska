import { Model } from 'alaska-model';
import { Colors } from '@samoyed/types';

declare class AdminMenu extends Model { }
interface AdminMenu extends AdminMenuFields { }

export interface AdminMenuFields {
  label: string;
  icon: string;
  type: 'link' | 'group';
  parent: string;
  nav?: string;
  link: string;
  badge: string;
  badgeColor: Colors;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}

export default AdminMenu;
