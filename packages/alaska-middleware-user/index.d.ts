import { MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

export interface UserMiddlewareOptions extends MiddlewareOptions {
}

declare const sessionMiddleware: MiddlewareGenerator<UserMiddlewareOptions>;

export default sessionMiddleware;
