import { MiddlewareGenerator, MiddlewareConfig, Context } from 'alaska-http';

export interface ClientMiddlewareConfig extends MiddlewareConfig {
  // client token所在的HTTP Header，默认为 client-token
  tokenHeader?: string;
  // 自定义获取Token函数
  getToken?: (ctx: Context) => string;
  // 自动续Client过期时间
  extendTime?: number;
}

declare const clientMiddleware: MiddlewareGenerator<ClientMiddlewareConfig>;

export default clientMiddleware;
