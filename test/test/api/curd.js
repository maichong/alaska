import test from 'tape';
import akita from 'akita';
import ArticleCat from '../../src/models/ArticleCat';

const ArticleCatApi = akita('api/article-cat');
const ArticleApi = akita('api/article');

test('api curd', (troot) => {
  test('create', async(t) => {
    await (new ArticleCat({ name: 'test api' })).save();
    let cat = await ArticleCatApi.findOne({ name: 'test api' });

    let article = await ArticleApi.create({
      cat: cat.id,
      title: 'api test'
    });

    let count = await ArticleApi.count({ cat: cat.id });

    t.equal(count, 1, 'count after create');

    // paginate
    let pages = await ArticleApi.paginate({ cat: cat.id });
    t.equal(pages.total, count, 'paginate title');

    let article2 = await ArticleApi.findById(article.id);

    t.equal(article.title, article2.title, 'api find by id');

    let updated = await ArticleApi.update(article2.id, { title: 'test update api' });
    t.equal(updated.title, 'test update api', 'api update');

    await ArticleApi.remove(article.id);

    let record = await ArticleApi.findById(article.id);
    t.equal(record, null, 'api remove');

    // multi update
    await ArticleApi.create({ cat: cat.id, title: 'api test multi 1' });
    await ArticleApi.create({ cat: cat.id, title: 'api test multi 2' });

    let updateResult = await ArticleApi.update({ title: 'test multi' }).where({ cat: cat.id });
    t.equal(updateResult.count, 2, 'update res count');
    t.equal(updateResult.updated, 2, 'update res updated');

    // list
    let list = await ArticleApi.find({ cat: cat.id });
    t.equal(list.length, 2, 'list length');
    t.equal(list[0].title, 'test multi', 'list content 1');
    t.equal(list[1].title, 'test multi', 'list content 2');

    // multi remove
    let { removed } = await ArticleApi.remove({ cat: cat.id });
    t.equal(removed, 2, 'removed result');
    t.equal(await ArticleApi.count({ cat: cat.id }), 0, 'api count after multi remove');

    t.end();
  });

  test('clear', async(t) => {
    await ArticleCat.remove({ name: 'test api' });
    t.end();
  });

  troot.end();
});
