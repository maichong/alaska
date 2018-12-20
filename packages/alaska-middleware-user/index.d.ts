import { MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

export interface UserMiddlewareOptions extends MiddlewareOptions {
}

declare const userMiddleware: MiddlewareGenerator<UserMiddlewareOptions>;

export default userMiddleware;
