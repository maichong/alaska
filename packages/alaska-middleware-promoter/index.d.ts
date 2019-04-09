import * as Cookies from 'cookies';
import { MiddlewareGenerator, MiddlewareConfig } from 'alaska-http';

export interface PromoterMiddlewareConfig extends MiddlewareConfig {
  queryKey?: string;
  cookieOptions?: Cookies.SetOption;
}

declare const PromoterMiddleware: MiddlewareGenerator<PromoterMiddlewareConfig>;

export default PromoterMiddleware;
