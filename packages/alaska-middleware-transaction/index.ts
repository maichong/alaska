import { Context } from 'alaska-http';
import * as pathToRegexp from 'path-to-regexp';
import {
  TransactionMiddlewareOptions,
  CustomIgnoreFunction,
  IngoreRule
} from '.';

export default function (options: TransactionMiddlewareOptions) {
  const ignoreMethods = options.ignoreMethods || [];
  let ignores: Array<RegExp | CustomIgnoreFunction> = null;

  function convert(input: IngoreRule) {
    if (typeof input === 'string') {
      ignores.push(pathToRegexp(input));
    } else if (input instanceof RegExp || typeof input === 'function') {
      ignores.push(input);
    } else {
      throw new Error(`Invalid transaction ignore option: ${String(input)}`);
    }
  }

  if (options.ignore) {
    ignores = [];
    if (Array.isArray(options.ignore)) {
      options.ignore.forEach(convert);
    } else {
      convert(options.ignore);
    }
  }

  return async function transactionMiddleware(ctx: Context, next: Function) {
    // 初始化 ctx.dbSession

    function initSession(): boolean {
      if (ignoreMethods.includes(ctx.method)) {
        return false;
      }
      if (ignores) {
        for (let reg of ignores) {
          if (
            (reg instanceof RegExp && reg.test(ctx.path))
            // @ts-ignore
            || (typeof reg === 'function' && reg(ctx.path, ctx))
          ) {
            return false;
          }
        }
      }
      return true;
    }

    if (initSession()) {
      // 启用事务
      ctx.dbSession = await ctx.service.db.startSession();
      await ctx.dbSession.startTransaction();
    }

    try {
      await next();
    } catch (error) {
      if (!ctx.dbSession) throw error;

      // 业务错误，回滚
      if (ctx.dbSession.inTransaction()) {
        await ctx.dbSession.abortTransaction();
      }
      if (error.errorLabels && error.errorLabels.indexOf('TransientTransactionError') >= 0) {
        // 数据库事务冲突
        ctx.body = null;
        ctx.throw(503); // 系统繁忙
      } else {
        // 其他错误
        throw error;
      }
    }

    // 不在事务中
    if (!ctx.dbSession) return;
    if (!ctx.dbSession.inTransaction()) return;

    // 业务成功，提交
    try {
      await ctx.dbSession.commitTransaction();
    } catch (error) {
      // 提交错误，回滚
      await ctx.dbSession.abortTransaction();
      ctx.body = null;
      ctx.throw(503); // 系统繁忙
    }
  };
}
