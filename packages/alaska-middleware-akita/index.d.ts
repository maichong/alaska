import { MiddlewareGenerator, MiddlewareOptions, Context } from 'alaska-http';

export interface AkitaMiddlewareOptions extends MiddlewareOptions {
}

declare const akitaMiddleware: MiddlewareGenerator<AkitaMiddlewareOptions>;

export default akitaMiddleware;
