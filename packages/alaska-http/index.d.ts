import * as Koa from 'koa';
import { Extension, Service, MainService } from 'alaska';
import { ListenOptions } from 'net';
import { Server } from 'http';
import * as mongodb from 'mongodb';
import * as KoaRouter from 'koa-router';

declare module 'alaska' {
  export interface MainService {
    server: Server;
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
  export interface Request {
    body: any;
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
  /**
   * Current client locale
   */
  locale?: string;
}

export interface AlaskaContext {
  /**
   * url params
   */
  params: any;
  /**
   * the router instance
   */
  router: Router;
  session?: Session;
  sessionKey?: string;
  sessionId?: string;
  /**
   * User
   */
  user?: any;
  /**
   * Main Service
   */
  main: MainService;
  /**
   * Current Service
   */
  service: Service;
  /**
   * MongoDB Session
   */
  dbSession?: mongodb.ClientSession;
  /**
   * Current client locale
   */
  locale?: string;
}

export interface Context extends Koa.ParameterizedContext<ContextState, AlaskaContext> {
}

export interface Router extends KoaRouter<ContextState, AlaskaContext> {
}

export interface Middleware extends Koa.Middleware<ContextState, AlaskaContext> {
}

export interface MiddlewareOptions {
  [key: string]: any;
  sort?: number;
}

export interface MiddlewareGenerator<T extends MiddlewareOptions> {
  (options: T, main: MainService): Koa.Middleware;
}

export interface Session {
  [key: string]: any;
  isNew: boolean;
  toJSON(): Object;
  isChanged(prev: string): boolean;
}
