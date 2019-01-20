import { Context, MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

export interface CustomIgnoreFunction {
  (path: string, ctx: Context): boolean;
}

export type IngoreRule = RegExp | string | CustomIgnoreFunction;

export interface TransactionMiddlewareOptions extends MiddlewareOptions {
  ignore?: IngoreRule | IngoreRule[];
  ignoreMethods?: string[];
}

declare const transactionMiddleware: MiddlewareGenerator<TransactionMiddlewareOptions>;

export default transactionMiddleware;
