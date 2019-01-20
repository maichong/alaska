import * as Cookies from 'cookies';
import { Context, MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

declare module 'alaska-http' {
  interface Context {
    session: Session;
    sessionKey: string;
    sessionId: string;
  }
}

export interface CookiesOptions extends Cookies.SetOption {
  key?: string;
}

export interface Session {
  [key: string]: any;
  isNew: boolean;
  toJSON(): Object;
  isChanged(prev: string): boolean;
}

export interface CustomIgnoreFunction {
  (path: string, ctx: Context): boolean;
}

export type IngoreRule = RegExp | string | CustomIgnoreFunction;

export interface SessionMiddlewareOptions extends MiddlewareOptions {
  store: any;
  cookie: CookiesOptions;
  // 自定义获取Session Id函数
  getSessionId?: (ctx: Context, key: string, cookieOpts: CookiesOptions) => string;
  // 自定义设置Session Id函数
  setSessionId?: (ctx: Context, key: string, sid: string, cookieOpts: CookiesOptions) => void;
  ignore?: IngoreRule | IngoreRule[];
}

declare const sessionMiddleware: MiddlewareGenerator<SessionMiddlewareOptions>;

export default sessionMiddleware;
