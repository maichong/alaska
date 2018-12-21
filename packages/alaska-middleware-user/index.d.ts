import { MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

export interface UserMiddlewareOptions extends MiddlewareOptions {
  enableBasicAuth?: boolean;
}

declare const userMiddleware: MiddlewareGenerator<UserMiddlewareOptions>;

export default userMiddleware;
