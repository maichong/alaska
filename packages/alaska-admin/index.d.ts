import { Service } from 'alaska';
import User from 'alaska-user/models/User';
import AdminNav from 'alaska-admin/models/AdminNav';
import AdminMenu from 'alaska-admin/models/AdminMenu';
import { Settings } from 'alaska-admin-view';
import { Model } from 'alaska-model';
import { Context } from 'alaska-http';
import RegisterNav from './sleds/RegisterNav';
import RegisterMenu from './sleds/RegisterMenu';

declare module 'alaska' {
  export interface ConfigData {
    superMode?: SuperModeConfig;
  }
}

declare module 'alaska-http' {
  export interface ContextState {
    superMode?: boolean;
    adminApi?: string;
  }
}

export interface SuperModeConfig {
  cookie?: string;
  userId?: string | string[];
  username?: string | string[];
  email?: string | string[];
}

export interface RegisterNavParams {
  id: string;
  label: string;
  sort?: number;
  ability?: string;
  super?: boolean;
  activated?: boolean;
}

export interface RegisterMenuParams {
  id: string;
  label: string;
  icon?: string;
  type: string;
  parent?: string;
  nav?: string;
  service?: string;
  link?: string;
  sort?: number;
  ability?: string;
  super?: boolean;
  activated?: boolean;
}

export interface ActionSledParams {
  ctx: Context;
  admin: User;
  model: typeof Model;
  records: Model[];
  record: Model;
  body: any;
}

export class AdminService extends Service {
  models: {
    AdminNav: typeof AdminNav;
    AdminMenu: typeof AdminMenu;
  };

  sleds: {
    RegisterNav: typeof RegisterNav;
    RegisterMenu: typeof RegisterMenu;
  };

  settings(settings: Settings, user?: User): Promise<void>;
}

declare const adminService: AdminService;

export default adminService;
