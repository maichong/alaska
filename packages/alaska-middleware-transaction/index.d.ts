import { Context, MiddlewareGenerator, MiddlewareConfig } from 'alaska-http';

export interface CustomIgnoreFunction {
  (path: string, ctx: Context): boolean;
}

export type IngoreRule = RegExp | string | CustomIgnoreFunction;

export interface TransactionMiddlewareConfig extends MiddlewareConfig {
  ignore?: IngoreRule | IngoreRule[];
  ignoreMethods?: string[];
}

declare const transactionMiddleware: MiddlewareGenerator<TransactionMiddlewareConfig>;

export default transactionMiddleware;
