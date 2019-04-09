import { MiddlewareGenerator, MiddlewareConfig } from 'alaska-http';

export interface UserMiddlewareConfig extends MiddlewareConfig {
  enableBasicAuth?: boolean;
}

declare const userMiddleware: MiddlewareGenerator<UserMiddlewareConfig>;

export default userMiddleware;
