// @flow

import PostCat from '../models/PostCat';

//处理文章类目
export async function all(ctx: Alaska$Context) {
  let cats = await PostCat.find();
  let map = {};
  cats = cats.map((c) => {
    let data = c.data();
    data.subs = [];
    map[data.id] = data;
    return data;
  });

  cats.forEach((c) => {
    if (c.parent && map[c.parent]) {
      map[c.parent].subs.push(c);
    }
  });

  ctx.body = cats.filter((c) => {
    let parent = c.parent;
    delete c.parent;
    if (!c.subs.length) {
      delete c.subs;
    }
    return !parent;
  });
}
