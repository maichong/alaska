import { Extension, ObjectMap } from 'alaska';
import * as Router from 'koa-router';

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

export interface MethodDecorator {
  (fn: ApiMiddleware, allow?: boolean): void;
}

export const GET: MethodDecorator;
export const POST: MethodDecorator;
export const PATCH: MethodDecorator;
export const PUT: MethodDecorator;
export const DELETE: MethodDecorator;
export const OPTIONS: MethodDecorator;
export const HEAD: MethodDecorator;

export interface ApiMiddleware extends Router.IMiddleware {
  _methods?: {
    GET?: boolean;
    POST?: boolean;
    PATCH?: boolean;
    PUT?: boolean;
    DELETE?: boolean;
    OPTIONS?: boolean;
    HEAD?: boolean;
  };
}

export interface RestApi {
  count?: ApiMiddleware;
  paginate?: ApiMiddleware;
  show?: ApiMiddleware;
  list?: ApiMiddleware;
  create?: ApiMiddleware;
  update?: ApiMiddleware;
  updateMulti?: ApiMiddleware;
  remove?: ApiMiddleware;
  removeMulti?: ApiMiddleware;
  watch?: ApiMiddleware;
}

export type RestActions = keyof RestApi;

export interface CustomApi extends RestApi {
  [key: string]: ApiMiddleware;
}

export default class ApiExtension extends Extension { }
