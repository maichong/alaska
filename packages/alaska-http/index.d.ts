import * as Koa from 'koa';
import * as Router from 'koa-router';
import { Extension, Service, MainService } from 'alaska';
import { ListenOptions } from 'net';
import { Server } from 'http';
// import User from 'alaska-user/models/User';

declare module 'alaska' {
  export interface MainService {
    app: Koa;
    getRouter(prefix: string): Router;
    initHttp(): Promise<void>;
    initMiddlewares(): Promise<void>;
    listen(): Promise<Server>;
  }

  export interface ConfigData {
    middlewares?: {
      [id: string]: MiddlewareOptions;
    };
    'alaska-http'?: {
      listen?: number | string | ListenOptions;
    };
  }
}

declare module 'alaska-modules' {
  interface MiddlewareMetadata {
    path: string;
    dismiss: boolean;
  }

  interface ModulesMetadata {
    middlewares: {
      [id: string]: MiddlewareMetadata;
    };
    loadMiddlewares(): Promise<void>;
  }

  interface Modules {
    middlewares: {
      [id: string]: MiddlewareGenerator<any>;
    };
  }
}

declare module 'koa' {
  export interface Context {
    state: any | ContextState;
  }
  export interface Request {
    body: any;
  }
}

declare module 'koa-router' {
  export interface IRouterContext extends Context {
  }
}

export default class HttpExtension extends Extension { }

export interface ContextState {
  [key: string]: any;
  /**
   * 运行环境
   */
  env?: 'production' | 'development';
  /**
   * 是否是JSON API接口
   */
  jsonApi?: boolean;
}

export interface Context extends Koa.Context {
  /**
   * url params
   */
  params: any;
  /**
   * the router instance
   */
  router: Router;
  /**
   * User
   */
  user?: any;
  /**
   * Main Service
   */
  main: MainService;
}

export interface MiddlewareOptions {
  [key: string]: any;
  sort?: number;
}

export interface MiddlewareGenerator<T extends MiddlewareOptions> {
  (options: T, main: MainService): Koa.Middleware;
}
