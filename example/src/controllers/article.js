import Article from '../models/Article';

export default async function (ctx) {
  let articles = await Article.paginate().page(ctx.query.page || 1).limit(10);
  await ctx.show('article/list', { articles });
}
