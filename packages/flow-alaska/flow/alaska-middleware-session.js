import type { Middleware } from 'koa';

declare module 'alaska-middleware-session' {
  declare export default (options: Object) => Middleware;
}
