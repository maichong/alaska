import * as Cookies from 'cookies';
import { MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

export interface PromoterMiddlewareOptions extends MiddlewareOptions {
  queryKey?: string;
  cookieOptions?: Cookies.SetOption;
}

declare const PromoterMiddleware: MiddlewareGenerator<PromoterMiddlewareOptions>;

export default PromoterMiddleware;
