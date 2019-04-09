import * as Cookies from 'cookies';
import { Context, MiddlewareGenerator, MiddlewareConfig } from 'alaska-http';

export interface CookiesOptions extends Cookies.SetOption {
  key?: string;
}

export interface CustomIgnoreFunction {
  (path: string, ctx: Context): boolean;
}

export type IngoreRule = RegExp | string | CustomIgnoreFunction;

export interface SessionMiddlewareConfig extends MiddlewareConfig {
  store: any;
  cookie: CookiesOptions;
  // 自定义获取Session Id函数
  getSessionId?: (ctx: Context, key: string, cookieOpts: CookiesOptions) => string;
  // 自定义设置Session Id函数
  setSessionId?: (ctx: Context, key: string, sid: string, cookieOpts: CookiesOptions) => void;
  ignore?: IngoreRule | IngoreRule[];
}

declare const sessionMiddleware: MiddlewareGenerator<SessionMiddlewareConfig>;

export default sessionMiddleware;
