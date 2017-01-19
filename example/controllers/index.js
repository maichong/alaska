export default async function (ctx) {
  console.log('start');
  let res = await ctx.show('index.swig');
  console.log('res', res);
}
