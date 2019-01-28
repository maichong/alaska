import { Extension, ObjectMap } from 'alaska';
import { Middleware } from 'alaska-http';

declare module 'alaska' {
  export interface Service {
    initApi(): Promise<void>;
  }
}

declare module 'alaska-modules' {
  export interface ServiceMetadata {
    api?: ObjectMap<string>;
  }

  export interface PluginMetadata {
    api?: ObjectMap<string>;
  }

  export interface ServiceModules {
    api: ObjectMap<CustomApi>;
  }

  export interface PluginModules {
    api: ObjectMap<CustomApi>;
  }
}

export interface RestApi {
  count?: Middleware;
  paginate?: Middleware;
  show?: Middleware;
  list?: Middleware;
  create?: Middleware;
  update?: Middleware;
  updateMulti?: Middleware;
  remove?: Middleware;
  removeMulti?: Middleware;
  watch?: Middleware;
}

export type RestActions = keyof RestApi;

export interface CustomApi extends RestApi {
  [key: string]: Middleware;
}

export default class ApiExtension extends Extension { }
