import { MiddlewareGenerator, MiddlewareConfig, Context } from 'alaska-http';

export interface AkitaMiddlewareConfig extends MiddlewareConfig {
}

declare const akitaMiddleware: MiddlewareGenerator<AkitaMiddlewareConfig>;

export default akitaMiddleware;
