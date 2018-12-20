import { MiddlewareGenerator, MiddlewareOptions, Context } from 'alaska-http';

export interface ClientMiddlewareOptions extends MiddlewareOptions {
  // client token所在的HTTP Header，默认为 client-token
  tokenHeader?: string;
  // 自定义获取Token函数
  getToken?: (ctx: Context) => string;
}

declare const clientMiddleware: MiddlewareGenerator<ClientMiddlewareOptions>;

export default clientMiddleware;
