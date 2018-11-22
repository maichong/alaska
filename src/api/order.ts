import { Context } from 'alaska-http';

export function test(ctx: Context) {
  ctx.body = ctx.params;
}
